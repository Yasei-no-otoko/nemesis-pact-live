import {start} from '../../server/voice.mjs';
import {waitUntil} from '@vercel/functions';
export function POST(request){return start(request,{defer:waitUntil});}
