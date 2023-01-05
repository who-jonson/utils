import Resumable from 'resumablejs';
import { ref } from 'vue-demi';
import { isDef, isFunction } from '@whoj/utils-core';
import { tryOnMounted } from './tryOnMounted';
import { type ComputedRefableElement, unrefElement } from './unrefOfEl';

type ResumableFile = Resumable['files'][number];
type ConfigurationHash = ConstructorParameters<typeof Resumable>;

interface UploaderTargetFunction {
  (uploader: Resumable): Resumable;
}

interface UploaderTargetObject {
  browse: ComputedRefableElement;
  drop?: ComputedRefableElement;
}

interface ResumableFileObject {
  file: ResumableFile;
  progress: number;
  status: 'uploading' | 'success' | 'error' | 'canceled' | 'retrying';
}

export interface UseResumableUploaderOptions extends ConfigurationHash {}

export function useResumableUploader(
  options: UseResumableUploaderOptions,
  target: UploaderTargetObject | UploaderTargetFunction
) {
  const files = ref<ResumableFileObject[]>([]);
  const uploader = ref<Resumable>();

  const findFile = (file: ResumableFile) => {
    return files.value.find(item => item.file.uniqueIdentifier === file.uniqueIdentifier && item.status !== 'canceled');
  };

  // cancel an individual file
  const cancelFile = (file: ResumableFile) => {
    const _file = findFile(file);
    if (_file) {
      _file.status = 'canceled';
      file.cancel();
    }
  };

  const createResumable = () => {
    const _uploader = new Resumable({
      maxChunkRetries: 1,
      testChunks: false,
      ...options
    });

    if (!_uploader.support) {
      throw new Error('Your browser doesn\'t support chunked uploads. Get a better browser.');
    }

    if (isFunction(target)) {
      uploader.value = target(_uploader);
    } else {
      const _browseEl = unrefElement(target.browse);
      if (_browseEl) {
        _uploader.assignBrowse(_browseEl, false);
      }

      if (isDef<ComputedRefableElement>(target.drop)) {
        const _dropEl = unrefElement(target.drop);
        if (_dropEl) {
          _uploader.assignDrop(_dropEl);
        }
      }
      uploader.value = _uploader;
    }

    uploader.value.on('fileAdded', (file: ResumableFile) => {
      (file as any).hasUploaded = false;
      // keep a list of files with some extra data that we can use as props
      files.value.push({
        file,
        status: 'uploading',
        progress: 0
      });
      uploader.value!.upload();
    });

    uploader.value.on('fileSuccess', (file: ResumableFile) => {
      findFile(file)!.status = 'success';
    });

    uploader.value.on('fileError', (file) => {
      findFile(file)!.status = 'error';
    });

    uploader.value.on('fileRetry', (file) => {
      findFile(file)!.status = 'retrying';
    });

    uploader.value.on('fileProgress', (file: ResumableFile) => {
      // console.log('fileProgress', progress)
      const localFile = findFile(file);
      // if we are doing multiple chunks we may get a lower progress number if one chunk response comes back early
      const progress = file.progress(false);
      if (progress > localFile!.progress) {
        localFile!.progress = progress;
      }
    });
  };

  tryOnMounted(() => {
    createResumable();
  });

  return {
    files,
    uploader,
    findFile,
    cancelFile
  };
}

