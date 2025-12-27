import {
    init as coreInit,
} from '@cornerstonejs/core';
import {
    init as toolsInit,
} from '@cornerstonejs/tools';

export async function initCornerstone() {
    await coreInit();
    await toolsInit();
}
