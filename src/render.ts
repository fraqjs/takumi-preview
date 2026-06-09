import { loadBuiltinFontsForService, TakumiService } from '@fraqjs/plugin-takumi';
import React from 'react';

import type { PreviewMeta, PreviewRenderOptions, PreviewTarget } from './types';

const defaultRenderOptions: PreviewRenderOptions = {
  width: 1200,
  height: 630,
  devicePixelRatio: 2,
};

export interface RenderPreviewResult {
  image: Buffer;
  meta: PreviewMeta;
}

export async function renderPreview(target: PreviewTarget): Promise<RenderPreviewResult> {
  const renderStart = performance.now();
  const service = new TakumiService(target.module.previewServiceOptions);

  try {
    await loadBuiltinFontsForService(service);
    await target.module.previewSetup?.(service);

    const props = target.module.previewProps ?? {};
    const renderOptions = {
      ...defaultRenderOptions,
      ...target.module.previewRenderOptions,
    };
    const element = React.createElement(target.module.default, props);
    const image = target.module.previewUseEmoji
      ? await service.renderJsxWithEmoji(element, renderOptions, undefined, target.module.previewEmojiType)
      : await service.renderJsx(element, renderOptions);

    return {
      image,
      meta: {
        filePath: target.filePath,
        renderMs: Math.round(performance.now() - renderStart),
        renderedAt: new Date().toISOString(),
        renderOptions,
      },
    };
  } finally {
    service.dispose();
  }
}
