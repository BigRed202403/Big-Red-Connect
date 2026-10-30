import {digest} from './publisher-core.mjs';
import {assignedDate,centralToUtc,checkDateAvailable,dateInfo,reviewHash} from './review-store.mjs';

const assert=(ok,code)=>{if(!ok)throw new Error(code)};

export async function importFutureDrafts(storage,batch,actor){
  assert(batch&&/^future-[a-z0-9-]{1,80}$/.test(batch.batchId),'invalid-future-batch-id');
  assert(batch.timezone==='America/Chicago'&&batch.centralTime==='12:00','invalid-future-batch-time');
  assert(/^[a-f0-9]{64}$/.test(batch.sourceSha256||''),'invalid-future-batch-source');
  assert(Array.isArray(batch.posts)&&batch.posts.length>0&&batch.posts.length<=365,'invalid-future-batch-size');
  assert(typeof actor==='string'&&actor.length>3,'authenticated-owner-required');
  const fingerprint=await digest(JSON.stringify(batch));
  return storage.transaction(async tx=>{
    const receiptKey='future-batch:'+batch.batchId,prior=await tx.get(receiptKey);
    if(prior){assert(prior.fingerprint===fingerprint,'future-batch-id-conflict');return {...prior,replayed:true};}
    const existing=await tx.list({prefix:'review:',limit:1001});
    assert(existing.size+batch.posts.length<=1000,'review-archive-maintenance-required');
    const seen=new Set(),staged=[],at=new Date().toISOString();
    for(const item of batch.posts){
      assert(item&&item.id===item.date&&/^brc-20\d\d-\d\d-\d\d$/.test(item.originalId||''),'invalid-future-draft');
      dateInfo(item.id);assert(!seen.has(item.id),'duplicate-daily-slot');seen.add(item.id);
      assert(!await tx.get('review:'+item.id),'future-date-already-exists');
      await checkDateAvailable(tx,item.id,item.id);
      assert(typeof item.caption==='string'&&item.caption.trim()&&item.caption.length<=5000,'invalid-caption');
      assert(/^[A-Za-z0-9_-]{1,120}$/.test(item.assetId||''),'invalid-asset-id');
      const asset=await tx.get('review-asset:'+item.assetId);
      assert(asset&&asset.kind==='seasonal'&&asset.key==='review-image:'+asset.sha256,'future-image-not-found');
      const scheduledAt=centralToUtc(item.id,batch.centralTime);
      const post={
        id:item.id,...dateInfo(item.id),caption:item.caption,
        sourceRef:'attached-json:'+batch.sourceSha256+'#'+item.originalId,sourceVerified:true,
        scheduledAt,centralTime:batch.centralTime,asset,state:'Needs Review',revision:1,approval:null,
        history:[{action:'import-draft',actor,at,note:'Exact corrected batch caption, selected seasonal artwork, and noon Central proposal imported. Owner approval required before publishing.',before:null,after:{state:'Needs Review',scheduledAt,assetId:asset.id}}],
        preparation:{method:'corrected-seasonal-batch-import',batchId:batch.batchId,timeIsProposal:true,imageIsProposal:false,awaitingOwnerApproval:true},
        sourceVerification:{method:'attached-json-sha256',actor,reference:batch.sourceSha256,captionSha256:await digest(item.caption)},
        reviewFlags:[]
      };
      post.hash=await reviewHash(post);assert(assignedDate(post)===item.id,'future-date-assignment-failed');staged.push(post);
    }
    for(const post of staged)await tx.put('review:'+post.id,post);
    const receipt={fingerprint,batchId:batch.batchId,sourceSha256:batch.sourceSha256,importedAt:at,actor,created:staged.length,approved:0,firstDate:staged[0].id,lastDate:staged.at(-1).id};
    await tx.put(receiptKey,receipt);return receipt;
  });
}
