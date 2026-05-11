import { createRoot } from 'react-dom/client';
import React, { createElement } from 'react';
import { App } from './widget/App';
import type { WidgetConfig } from './widget/types';

const HOST_ID = 'floating-widget-host';

/**
 * `document.currentScript`는 스크립트가 평가되는 시점에만 유효하므로
 * top-level에서 즉시 캡처해 클로저로 보관한다.
 */
const currentScript = document.currentScript as HTMLScriptElement | null;

function readConfig(script: HTMLScriptElement | null): WidgetConfig {
  if (!script) return {};
  const ds = script.dataset;
  return {
    apiUrl: ds.apiUrl,
    tenant: ds.tenant,
  };
}

const config = readConfig(currentScript);

function mount() {
  if (document.getElementById(HOST_ID)) return;

  const host = document.createElement('div');
  host.id = HOST_ID;
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  const styleReset = document.createElement('style');
  styleReset.textContent = `
    :host { all: initial; }
    * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Pretendard", sans-serif; }
  `;
  shadow.appendChild(styleReset);

  const mountPoint = document.createElement('div');
  shadow.appendChild(mountPoint);

  createRoot(mountPoint).render(createElement(App as React.ComponentType<{ config?: WidgetConfig }>, { config }));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
