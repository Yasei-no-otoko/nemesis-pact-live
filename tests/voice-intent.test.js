'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{isProposalWithdrawal}=require('../src/voice.js');

test('recognizes explicit whole-proposal withdrawal commands',()=>{
 for(const text of ['withdraw','Please withdraw.','cancel that','cancel the proposal, please','I withdraw the current offer','前の提案を撤回して','提案を取り消してください','取り消して'])assert.equal(isProposalWithdrawal(text),true,text);
});

test('recognizes a terminal withdrawal after an earlier transcript prefix',()=>{
 assert.equal(isProposalWithdrawal('Please put the sanctuary on the left. Actually, can you'),false);
 assert.equal(isProposalWithdrawal('Please put the sanctuary on the left. Actually, can you cancel that'),true);
 assert.equal(isProposalWithdrawal('敵の弾を遅くして、前の提案を撤回して'),true);
 assert.equal(isProposalWithdrawal('敵の弾を遅くしたい。前の提案を撤回して'),true);
 assert.equal(isProposalWithdrawal('Please put the sanctuary on the left, then withdraw the proposal.'),true);
});

test('keeps clause changes, negation, questions and discussed cancellation out of withdrawal intent',()=>{
 for(const text of [
  '結界を撤回。その代わり敵の弾を遅く',
  '安全は撤回、その代わり敵の弾を遅く',
  'remove sanctuary and slow fire',
  'withdraw the sanctuary and slow fire',
  'do not cancel that',
  "I don't want to cancel the proposal",
  'If we cancel that, what happens?',
  'Could you cancel that?',
  'We discussed whether to withdraw the proposal',
  '前の提案を撤回しないで',
  'もし前の提案を撤回するなら',
  '提案の撤回について話して'
 ])assert.equal(isProposalWithdrawal(text),false,text);
});
