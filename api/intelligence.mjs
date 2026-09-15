import {handle} from '../server/intelligence.mjs';
import {handle as debrief} from '../server/debrief.mjs';

// Share the deployment entry point; the dedicated debrief handler owns auth/quota.
export function POST(request){
 const url=new URL(request.url);
 return url.pathname==='/api/debrief'||url.searchParams.get('operation')==='debrief'
  ?debrief(request):handle(request);
}
