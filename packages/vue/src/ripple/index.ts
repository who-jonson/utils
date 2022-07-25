import { isVue3 } from 'vue-demi';
import type { Directive, ObjectDirective, Plugin } from 'vue-demi';
import { isNumber, objectKeys } from '@whoj/utils-core';
import './_ripple.css';

type DirectiveEl = HTMLButtonElement | HTMLAnchorElement | HTMLElement;

export interface RippleOptions {
  /**
   *
   * @default `true`
   */
  enable?: boolean

  /**
   *
   * @default `rgba(0, 0, 0, 0.35)`
   */
  color?: string

  /**
   *
   * @default `1`
   */
  zIndex?: string
}

export interface DirectiveProps {
  /**
   *
   * @default `mousedown`
   */
  event: 'mousedown' | 'mouseup'

  /**
   *
   * @default `450`
   */
  transition: number
}

function setProps(modifiers: any, props: DirectiveProps) {
  // @ts-ignore
  modifiers.forEach((item) => {
    if (!isNumber(item))
      props.event = item;
    else
      props.transition = item;
  });
}

function makeRippleDir<T extends DirectiveEl, D extends string>(options?: RippleOptions): Directive<T, D> {
  return <ObjectDirective<T, D>>{
    [`${isVue3 ? 'beforeMount' : 'bind'}`]: (el, binding) => {
      // Default values.
      const props: DirectiveProps = {
        event: 'mousedown',
        transition: 600
      };

      setProps(objectKeys(binding.modifiers), props);

      el.addEventListener(props.event, (event) => {
        rippleEl(event, el);
      });

      const bg = binding.value || options?.color || 'rgba(0, 0, 0, 0.35)';
      const zIndex = options?.zIndex || '9999';

      const rippleEl = function(event, el: T) {
        const target = el;
        const targetBorder = parseInt((getComputedStyle(target).borderWidth).replace('px', ''));
        const clientX = event.clientX || event.touches[0].clientX;
        const clientY = event.clientY || event.touches[0].clientY;

        // Get necessary variables
        const rect = target.getBoundingClientRect();
        const left = rect.left;
        const top = rect.top;
        const width = target.offsetWidth;
        const height = target.offsetHeight;
        const dx = clientX - left;
        const dy = clientY - top;
        const maxX = Math.max(dx, width - dx);
        const maxY = Math.max(dy, height - dy);
        const style = window.getComputedStyle(target);
        const radius = Math.sqrt((maxX * maxX) + (maxY * maxY));
        const border = (targetBorder > 0) ? targetBorder : 0;

        // Create the ripple and its container
        const ripple = document.createElement('div');
        const rippleContainer = document.createElement('div');
        rippleContainer.className = 'ripple-container';
        ripple.className = 'ripple';

        // Styles for ripple
        ripple.style.marginTop = '0px';
        ripple.style.marginLeft = '0px';
        ripple.style.width = '1px';
        ripple.style.height = '1px';
        ripple.style.transition = `all ${props.transition}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        ripple.style.borderRadius = '50%';
        ripple.style.pointerEvents = 'none';
        ripple.style.position = 'relative';
        ripple.style.zIndex = zIndex;
        ripple.style.backgroundColor = bg;

        // Styles for rippleContainer
        rippleContainer.style.position = 'absolute';
        rippleContainer.style.left = `${0 - border}px`;
        rippleContainer.style.top = `${0 - border}px`;
        rippleContainer.style.height = '0';
        rippleContainer.style.width = '0';
        rippleContainer.style.pointerEvents = 'none';
        rippleContainer.style.overflow = 'hidden';

        // Store target position to change it after
        const storedTargetPosition = ((target.style.position).length > 0) ? target.style.position : getComputedStyle(target).position;
        // Change target position to relative to guarantee ripples correct positioning
        if (storedTargetPosition !== 'relative')
          target.style.position = 'relative';

        rippleContainer.appendChild(ripple);
        target.appendChild(rippleContainer);

        ripple.style.marginLeft = `${dx}px`;
        ripple.style.marginTop = `${dy}px`;

        rippleContainer.style.width = `${width}px`;
        rippleContainer.style.height = `${height}px`;
        rippleContainer.style.borderTopLeftRadius = style.borderTopLeftRadius;
        rippleContainer.style.borderTopRightRadius = style.borderTopRightRadius;
        rippleContainer.style.borderBottomLeftRadius = style.borderBottomLeftRadius;
        rippleContainer.style.borderBottomRightRadius = style.borderBottomRightRadius;

        rippleContainer.style.direction = 'ltr';

        setTimeout(() => {
          ripple.style.width = `${radius * 2}px`;
          ripple.style.height = `${radius * 2}px`;
          ripple.style.marginLeft = `${dx - radius}px`;
          ripple.style.marginTop = `${dy - radius}px`;
        }, 0);

        function clearRipple() {
          setTimeout(() => {
            ripple.style.backgroundColor = 'rgba(0, 0, 0, 0)';
          }, 250);

          // Timeout set to get a smooth removal of the ripple
          setTimeout(() => {
            rippleContainer.parentNode?.removeChild(rippleContainer);
          }, 850);

          el.removeEventListener('mouseup', clearRipple, false);
          el.removeEventListener('mouseleave', clearRipple, false);
          el.removeEventListener('dragstart', clearRipple, false);

          // After removing event set position to target to it's original one
          // Timeout it's needed to avoid jerky effect of ripple jumping out parent target
          setTimeout(() => {
            let clearPosition = true;

            for (const child of target.childNodes) {
              // @ts-ignore
              if (child.className === 'ripple-container')
                clearPosition = false;
            }

            if (clearPosition) {
              if (storedTargetPosition !== 'static')
                target.style.position = storedTargetPosition;
              else
                target.style.position = '';
            }
          }, props.transition + 250);
        }

        if (event.type === 'mousedown') {
          el.addEventListener('mouseup', clearRipple, false);
          el.addEventListener('mouseleave', clearRipple, false);
          el.addEventListener('dragstart', clearRipple, false);
        }
        else {
          clearRipple();
        }
      };
    }
  };
}

const RipplePlugin: Plugin = {
  install(app, options?: RippleOptions) {
    app.directive('ripple', makeRippleDir<DirectiveEl, string>(options));
  }
};

export default RipplePlugin;

declare module '@vue/runtime-dom' {
  interface AppContext {
    // @ts-ignore
    directives: {
      ripple: Directive<DirectiveEl, string>
    }
  }
}
