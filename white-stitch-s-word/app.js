const defaultProgress = { lessons: 0, phonics: [], spelling: [], reading: [], vocabulary: [], pronunciation: [], mastery: {} };
let storedProgress;
try { storedProgress = JSON.parse(localStorage.getItem('sww-progress') || 'null'); } catch { storedProgress = null; }
const state = {
  stars: Number(localStorage.getItem('sww-stars') || 0),
  audio: localStorage.getItem('sww-audio') !== 'off',
  level: Number(localStorage.getItem('sww-level') || 1),
  activity: 'sound', round: 0, correct: 0, misses: 0, roundMistakes: 0,
  progress: Object.assign({}, defaultProgress, storedProgress || {})
};
['phonics','spelling','reading','vocabulary','pronunciation'].forEach(k=>{ if(!Array.isArray(state.progress[k])) state.progress[k]=[]; });
if(!state.progress.mastery || typeof state.progress.mastery!=='object') state.progress.mastery={};

const screens = [...document.querySelectorAll('.screen')];
const byId = id => document.getElementById(id);
const activitySkill = { letter:'phonics', sound:'phonics', sight:'reading', build:'spelling', rhyme:'reading', sentence:'reading', punctuation:'reading', comprehension:'reading' };

const activities = {
  sound:{eyebrow:'Sound Detective',title:'Find the beginning sound',goal:'I can listen to a word and find its beginning sound.',instruction:'Tap the letter that begins the word.',rounds:[
    {visual:'🐱',prompt:'Which letter does cat begin with?',answers:['C','M','S'],correct:'C',hint:'Say “cat” slowly: c-c-cat.'},{visual:'🐶',prompt:'Which letter does dog begin with?',answers:['B','D','T'],correct:'D',hint:'Dog starts with the D sound.'},{visual:'🐟',prompt:'Which letter does fish begin with?',answers:['F','P','R'],correct:'F',hint:'Fish starts like “fun.”'},{visual:'☀️',prompt:'Which letter does sun begin with?',answers:['S','L','N'],correct:'S',hint:'Stretch it: sssun.'},{visual:'⚽',prompt:'Which letter does ball begin with?',answers:['G','B','K'],correct:'B',hint:'Ball begins like “blue.”'}]},
  letter:{eyebrow:'Letter Explorer',title:'Match the letter',goal:'I can match a picture to its beginning letter.',instruction:'Look at the picture. Tap its beginning letter.',rounds:[
    {visual:'🍎',prompt:'Which letter starts apple?',answers:['A','E','O'],correct:'A',hint:'Apple begins with A.'},{visual:'🐻',prompt:'Which letter starts bear?',answers:['B','D','P'],correct:'B',hint:'Bear begins with B.'},{visual:'🌙',prompt:'Which letter starts moon?',answers:['M','N','W'],correct:'M',hint:'Moon begins with M.'},{visual:'🐢',prompt:'Which letter starts turtle?',answers:['T','L','F'],correct:'T',hint:'Turtle begins with T.'},{visual:'🦓',prompt:'Which letter starts zebra?',answers:['Z','S','V'],correct:'Z',hint:'Zebra begins with Z.'}]},
  rhyme:{eyebrow:'Rhyme Time',title:'Choose the rhyming word',goal:'I can hear words that rhyme.',instruction:'Say the words. Tap the word that rhymes.',rounds:[
    {visual:'🐱',prompt:'Which word rhymes with cat?',answers:['hat','sun','dog'],correct:'hat',hint:'Rhyming words end with the same sound.'},{visual:'🐶',prompt:'Which word rhymes with dog?',answers:['frog','fish','ball'],correct:'frog',hint:'Dog and frog both end with “og.”'},{visual:'☀️',prompt:'Which word rhymes with sun?',answers:['run','red','top'],correct:'run',hint:'Sun and run both end with “un.”'},{visual:'🐝',prompt:'Which word rhymes with bee?',answers:['tree','car','book'],correct:'tree',hint:'Bee and tree both end with the long E sound.'},{visual:'🦊',prompt:'Which word rhymes with fox?',answers:['box','hat','pig'],correct:'box',hint:'Fox and box both end with “ox.”'}]},
  build:{eyebrow:'Build the Word',title:'Put the letters in order',goal:'I can put letters in the right order to make a word.',instruction:'Look at the picture. Tap the correctly built word.',rounds:[
    {visual:'🐱',prompt:'Build the word CAT.',answers:['CAT','CTA','ACT'],correct:'CAT',hint:'C comes first, then A, then T.'},{visual:'🐶',prompt:'Build the word DOG.',answers:['GOD','DGO','DOG'],correct:'DOG',hint:'D-O-G.'},{visual:'☀️',prompt:'Build the word SUN.',answers:['SUN','SNU','UNS'],correct:'SUN',hint:'S-U-N.'},{visual:'🐟',prompt:'Build the word FISH.',answers:['FISH','FSIH','IFSH'],correct:'FISH',hint:'F-I-S-H.'},{visual:'📘',prompt:'Build the word BOOK.',answers:['OBOK','BOOK','BOKO'],correct:'BOOK',hint:'B-O-O-K.'}]},
  sight:{eyebrow:'Sight Word Spotter',title:'Find the sight word',goal:'I can recognize common sight words.',instruction:'Listen or read. Tap the matching sight word.',rounds:[
    {visual:'👀',prompt:'Find the word THE.',answers:['the','see','go'],correct:'the',hint:'The word is T-H-E.'},{visual:'👀',prompt:'Find the word SEE.',answers:['my','see','like'],correct:'see',hint:'See has two E letters.'},{visual:'👀',prompt:'Find the word MY.',answers:['go','the','my'],correct:'my',hint:'My is M-Y.'},{visual:'👀',prompt:'Find the word LIKE.',answers:['like','look','little'],correct:'like',hint:'Like begins with L and ends with E.'},{visual:'👀',prompt:'Find the word GO.',answers:['no','go','so'],correct:'go',hint:'Go begins with G.'}]},
  sentence:{eyebrow:'Sentence Builder',title:'Put the sentence in order',goal:'I can choose words in the correct sentence order.',instruction:'Tap the sentence that sounds right.',rounds:[
    {visual:'🐶',prompt:'Which sentence is in the right order?',answers:['The dog runs.','Dog the runs.','Runs dog the.'],correct:'The dog runs.',hint:'A sentence can start with who or what: The dog...'},
    {visual:'🐱',prompt:'Which sentence is in the right order?',answers:['Cat the naps.','The cat naps.','Naps the cat.'],correct:'The cat naps.',hint:'Start with The cat.'},
    {visual:'👧',prompt:'Which sentence is in the right order?',answers:['I like books.','Books like I.','Like I books.'],correct:'I like books.',hint:'Start with I.'},
    {visual:'☀️',prompt:'Which sentence is in the right order?',answers:['Bright is sun the.','The sun is bright.','Sun the bright is.'],correct:'The sun is bright.',hint:'Start with The sun.'},
    {visual:'🐸',prompt:'Which sentence is in the right order?',answers:['The frog can jump.','Can frog the jump.','Jump the frog can.'],correct:'The frog can jump.',hint:'Start with The frog.'}]},
  punctuation:{eyebrow:'Sentence Fixer',title:'Fix capitals and punctuation',goal:'I can use a capital letter and ending punctuation.',instruction:'Tap the sentence that is written correctly.',rounds:[
    {visual:'✏️',prompt:'Which sentence is written correctly?',answers:['the cat runs.','The cat runs.','The cat runs'],correct:'The cat runs.',hint:'Start with a capital T and end with a period.'},
    {visual:'❓',prompt:'Which question is written correctly?',answers:['Where is my book?','where is my book?','Where is my book.'],correct:'Where is my book?',hint:'A question starts with a capital and ends with a question mark.'},
    {visual:'✏️',prompt:'Which sentence is written correctly?',answers:['I see a dog.','i see a dog.','I see a dog'],correct:'I see a dog.',hint:'The word I is capitalized, and the sentence ends with a period.'},
    {visual:'❗',prompt:'Which sentence is written correctly?',answers:['Look at that!','look at that!','Look at that'],correct:'Look at that!',hint:'Start with a capital and use an exclamation mark for excitement.'},
    {visual:'✏️',prompt:'Which sentence is written correctly?',answers:['we can read.','We can read.','We can read'],correct:'We can read.',hint:'Start with a capital W and end with a period.'}]},
  comprehension:{eyebrow:'Read & Answer',title:'Read a short passage',goal:'I can read a short passage and answer a question.',instruction:'Read or listen. Tap the best answer.',rounds:[
    {visual:'📖',prompt:'Mia has a red kite. The kite goes up in the wind. What color is Mia’s kite?',answers:['red','blue','green'],correct:'red',hint:'Look at the first sentence.'},
    {visual:'📖',prompt:'Ben feeds his fish each morning. The fish swims fast. What pet does Ben have?',answers:['a dog','a fish','a bird'],correct:'a fish',hint:'The first sentence names Ben’s pet.'},
    {visual:'📖',prompt:'Ava puts on boots because it is raining. Why does Ava wear boots?',answers:['It is raining.','It is sunny.','She is sleeping.'],correct:'It is raining.',hint:'The sentence tells why after the word because.'},
    {visual:'📖',prompt:'Leo reads a book before bed. Then he turns off the light. What does Leo do first?',answers:['Reads a book','Turns off the light','Eats lunch'],correct:'Reads a book',hint:'First comes before then.'},
    {visual:'📖',prompt:'Nora and Sam build a tall block tower. It falls, so they build it again. What do they build?',answers:['a tower','a kite','a boat'],correct:'a tower',hint:'The first sentence tells what they build.'}]}
};

function persistProgress(){ localStorage.setItem('sww-progress', JSON.stringify(state.progress)); }
function scoreFor(skill){ const a=state.progress[skill]; if(!a.length) return null; return Math.round(a.reduce((x,y)=>x+y,0)/a.length); }
function recordScore(skill, score){ state.progress[skill].push(score); if(state.progress[skill].length>8) state.progress[skill].shift(); persistProgress(); refreshProgress(); }
function showScreen(id){ screens.forEach(s=>s.classList.toggle('active',s.id===id)); window.scrollTo({top:0,behavior:'smooth'}); if(id==='progress') refreshProgress(); byId(id)?.focus?.({preventScroll:true}); }

document.addEventListener('click',e=>{ const nav=e.target.closest('[data-nav]'); if(nav){showScreen(nav.dataset.nav);return;} const act=e.target.closest('[data-activity]'); if(act&&!act.classList.contains('locked')){startActivity(act.dataset.activity);return;} });
function speak(text){ if(!state.audio||!window.speechSynthesis||typeof window.SpeechSynthesisUtterance==='undefined') return false; try{ window.speechSynthesis.cancel(); const u=new window.SpeechSynthesisUtterance(text.replace(/\//g,''));u.rate=.9;u.pitch=1.05;window.speechSynthesis.speak(u);return true;}catch{return false;} }
document.querySelectorAll('[data-speak]').forEach(b=>b.addEventListener('click',()=>speak(b.dataset.speak)));
const audioToggle=byId('audioToggle');
function refreshAudio(){audioToggle.textContent=state.audio?'🔊':'🔇';audioToggle.setAttribute('aria-pressed',String(state.audio));audioToggle.setAttribute('aria-label',state.audio?'Turn spoken help off':'Turn spoken help on');}
audioToggle.addEventListener('click',()=>{state.audio=!state.audio;localStorage.setItem('sww-audio',state.audio?'on':'off');refreshAudio();});refreshAudio();
function refreshStars(){
  byId('starCount').textContent=state.stars;
  byId('progressStars').textContent=state.stars;
  const shown=Math.min(state.stars,20);
  const meter=byId('stitchStarMeter');
  const fill=byId('stitchStarMeterFill');
  const text=byId('stitchStarText');
  if(meter){meter.setAttribute('aria-valuenow',String(shown));meter.setAttribute('aria-label',`Stitch has ${shown} of 20 stars`);}
  if(fill) fill.style.width=`${(shown/20)*100}%`;
  if(text) text.textContent=`${shown} / 20 stars`;
  const pill=document.querySelector('.pill[data-nav="progress"]');
  if(pill) pill.setAttribute('aria-label',`Open progress. ${state.stars} star${state.stars===1?'':'s'} earned`);
} refreshStars();

document.querySelectorAll('.level-card:not(.locked)').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.level-card').forEach(b=>b.classList.remove('selected'));btn.classList.add('selected');state.level=Number(btn.dataset.level);localStorage.setItem('sww-level',state.level);refreshProgress();speak(`${btn.querySelector('strong').textContent} selected.`);}));

function startActivity(type){state.activity=type in activities?type:'sound';state.round=0;state.correct=0;state.misses=0;state.roundMistakes=0;renderRound();showScreen('activity');}
function renderRound(){const a=activities[state.activity],r=a.rounds[state.round];state.roundMistakes=0;byId('activityEyebrow').textContent=a.eyebrow;byId('activityTitle').textContent=a.title;byId('activityGoal').textContent=`🎯 ${a.goal}`;byId('instructionText').textContent=a.instruction;byId('roundLabel').textContent=`${state.round+1} of ${a.rounds.length}`;byId('roundMeter').style.width=`${((state.round+1)/a.rounds.length)*100}%`;byId('activityVisual').textContent=r.visual;byId('questionText').textContent=r.prompt;byId('feedback').textContent='';byId('nextButton').disabled=true;const grid=byId('answerGrid');grid.innerHTML='';r.answers.forEach(ans=>{const b=document.createElement('button');b.textContent=ans;b.addEventListener('click',()=>chooseAnswer(b,ans));grid.appendChild(b);});}
function chooseAnswer(button,ans){const r=activities[state.activity].rounds[state.round],buttons=[...byId('answerGrid').children];if(ans===r.correct){buttons.forEach(b=>b.disabled=true);button.classList.add('correct');byId('feedback').textContent=state.roundMistakes?'You fixed it! Great trying! ⭐':'Great job! You and Stitch got it! ⭐';state.correct++;speak(state.roundMistakes?'You fixed it! Great trying!':'Great job! You got it!');byId('nextButton').disabled=false;return;}state.misses++;state.roundMistakes++;button.classList.add('wrong');button.disabled=true;if(state.roundMistakes===1){byId('feedback').textContent=`Almost! ${r.hint} Try again.`;speak(`Almost. ${r.hint} Try again.`);}else{buttons.forEach(b=>b.disabled=true);const correct=buttons.find(b=>b.textContent===r.correct);correct?.classList.add('correct');byId('feedback').textContent=`Nice trying! The answer is ${r.correct}. Stitch is learning too.`;speak(`Nice trying. The answer is ${r.correct}. Stitch is learning too.`);byId('nextButton').disabled=false;}}
byId('nextButton').addEventListener('click',()=>{const total=activities[state.activity].rounds.length;if(state.round<total-1){state.round++;renderRound();}else finishActivity();});
byId('hintButton').addEventListener('click',()=>{const h=activities[state.activity].rounds[state.round].hint;byId('feedback').textContent=`💡 ${h}`;speak(h);});
byId('activitySpeak').addEventListener('click',()=>speak(activities[state.activity].rounds[state.round].prompt));
byId('instructionSpeak').addEventListener('click',()=>speak(activities[state.activity].instruction));
byId('playAgain').addEventListener('click',()=>startActivity(state.activity));byId('continueResources').addEventListener('click',()=>showScreen('resources'));
function finishActivity(){state.stars++;state.progress.lessons=Number(state.progress.lessons||0)+1;localStorage.setItem('sww-stars',state.stars);const total=activities[state.activity].rounds.length;const score=Math.round((state.correct/total)*100);state.progress.mastery[state.activity]=Math.max(Number(state.progress.mastery[state.activity]||0),score);persistProgress();recordScore(activitySkill[state.activity],score);refreshStars();refreshJourney();byId('resultSummary').textContent=`You got ${state.correct} of ${total} rounds right. ${state.misses?`You kept trying through ${state.misses} tricky choice${state.misses===1?'':'s'}.`:'You solved every round without a miss!'}`;showScreen('results');speak(`You did it! You got ${state.correct} of ${total} rounds right. Great job!`);}

// Picture gallery: concrete visual examples with replayable spoken models.
const galleryCards=[...document.querySelectorAll('.image-card')];let selectedGallery=galleryCards[0];
function selectGallery(card){galleryCards.forEach(c=>c.classList.toggle('selected',c===card));selectedGallery=card;byId('galleryBig').textContent=card.querySelector('span').textContent;byId('galleryWord').textContent=card.dataset.galleryWord;byId('galleryExample').textContent=card.dataset.galleryExample;}
galleryCards.forEach(card=>card.addEventListener('click',()=>selectGallery(card)));
byId('gallerySpeak').addEventListener('click',()=>{speak(selectedGallery.dataset.galleryExample);});
byId('gallerySave').addEventListener('click',()=>{const b=byId('gallerySave'),saved=b.textContent.includes('Saved');b.textContent=saved?'♡ Save':'♥ Saved';b.setAttribute('aria-pressed',String(!saved));});

// Three-round quick check tied to gallery words and vocabulary/reading recognition.
const checks=[
  {prompt:'Which picture shows sun?',spoken:'Which picture shows sun?',options:[['☀️','sun'],['🐱','cat'],['📘','book']],correct:'sun',skill:'vocabulary'},
  {prompt:'Which word is the sight word “the”?',spoken:'Which word is the sight word, the?',options:[['the','the'],['dog','dog'],['run','run']],correct:'the',skill:'reading'},
  {prompt:'Which picture means “feeling glad”?',spoken:'Which picture means feeling glad?',options:[['😊','happy'],['☀️','sun'],['📘','book']],correct:'happy',skill:'vocabulary'}
];
let checkRound=0,checkCorrect=0,checkTried=false;
function renderCheck(){const q=checks[checkRound];checkTried=false;byId('checkProgress').textContent=`${checkRound+1} of ${checks.length}`;byId('checkPrompt').innerHTML=q.prompt.replace(/(sun|the|feeling glad)/,m=>`<strong>${m}</strong>`);byId('checkFeedback').textContent='';byId('checkNext').disabled=true;const box=byId('checkAnswers');box.innerHTML='';q.options.forEach(([display,value])=>{const b=document.createElement('button');b.innerHTML=`<span>${display}</span><small>${value}</small>`;b.addEventListener('click',()=>answerCheck(b,value));box.appendChild(b);});byId('checkNext').textContent=checkRound===checks.length-1?'Finish ✓':'Next →';}
function answerCheck(btn,val){const q=checks[checkRound],buttons=[...byId('checkAnswers').children];if(val===q.correct){buttons.forEach(x=>x.disabled=true);btn.classList.add('correct');if(!checkTried)checkCorrect++;byId('checkFeedback').textContent=checkTried?'Yes! You found it after another try.':'You got it! ⭐';speak(byId('checkFeedback').textContent);byId('checkNext').disabled=false;}else{checkTried=true;btn.disabled=true;btn.classList.add('wrong');byId('checkFeedback').textContent='Almost! Look at the picture or word and try again.';speak('Almost. Look again and try one more time.');}}
byId('checkNext').addEventListener('click',()=>{if(checkRound<checks.length-1){checkRound++;renderCheck();}else{const score=Math.round((checkCorrect/checks.length)*100);recordScore('vocabulary',score);recordScore('reading',score);byId('checkFeedback').textContent=`Quick check complete! ${checkCorrect} of ${checks.length} on the first try. Great learning!`;byId('checkNext').disabled=true;byId('checkAnswers').innerHTML='';speak('Quick check complete. Great learning!');}});
byId('checkRestart').addEventListener('click',()=>{checkRound=0;checkCorrect=0;renderCheck();});
byId('checkSpeak').addEventListener('click',()=>speak(checks[checkRound].spoken));renderCheck();

// Resource searching/saving.
document.querySelectorAll('.resource-card .save-button').forEach(btn=>btn.addEventListener('click',()=>{const saved=btn.textContent.includes('Saved');btn.textContent=saved?'♡ Save':'♥ Saved';btn.setAttribute('aria-pressed',String(!saved));}));
byId('resourceSearch').addEventListener('input',e=>{const q=e.target.value.toLowerCase();document.querySelectorAll('.resource-card').forEach(card=>{card.style.display=(card.textContent+' '+card.dataset.tags).toLowerCase().includes(q)?'':'none';});});

document.querySelectorAll('[data-decor]').forEach(btn=>btn.addEventListener('click',()=>byId(btn.dataset.decor).classList.toggle('hidden')));
document.querySelectorAll('[data-gate]').forEach(btn=>btn.addEventListener('click',()=>{if(btn.dataset.gate==='12'){byId('adultGate').classList.add('hidden');byId('adultDashboard').classList.remove('hidden');}else byId('gateFeedback').textContent='Try again. This check helps keep the adult area separate.';}));
byId('assignButton').addEventListener('click',()=>{byId('assignFeedback').textContent=`Assigned: ${byId('assignmentSelect').value}`;});byId('classroomButton').addEventListener('click',()=>byId('classroomPanel').classList.toggle('hidden'));

function refreshProgress(){
  byId('lessonsComplete').textContent=state.progress.lessons||0;
  const levelInfo={1:['🌱','Level 1','Baby Stitch'],2:['🧩','Level 2','Learning Stitch'],3:['✏️','Level 3','Smart Stitch'],4:['📚','Level 4','Super Smart Stitch']}[state.level]||['🌱','Level 1','Baby Stitch'];
  byId('levelIcon').textContent=levelInfo[0];byId('currentLevelLabel').textContent=levelInfo[1];byId('currentLevelName').textContent=levelInfo[2];
  const labels={phonics:'Phonics',spelling:'Spelling',reading:'Reading',vocabulary:'Vocabulary',pronunciation:'Pronunciation'};
  let lowest=null;
  Object.keys(labels).forEach(skill=>{const score=scoreFor(skill);const cap=skill[0].toUpperCase()+skill.slice(1);byId(`skill${cap}`).style.width=`${score??0}%`;byId(`skill${cap}Text`).textContent=score===null?'Not started':`${score}%`;if(score!==null&&(!lowest||score<lowest[1]))lowest=[skill,score];});
  const growth=byId('growthSummary'); if(growth){growth.innerHTML='';Object.keys(labels).forEach(skill=>{const scores=state.progress[skill];const item=document.createElement('div');item.className='growth-item';if(!scores.length)item.innerHTML=`<strong>${labels[skill]}</strong><span>Not started</span>`;else item.innerHTML=`<strong>${labels[skill]}</strong><span>First ${scores[0]}% → Latest ${scores[scores.length-1]}%</span>`;growth.appendChild(item);});}
  const mastery=byId('masteryList'); if(mastery){mastery.innerHTML='';const entries=Object.entries(state.progress.mastery||{});if(!entries.length) mastery.innerHTML='<p class="muted">Finish a lesson to add learning evidence here.</p>';else entries.sort((a,b)=>b[1]-a[1]).forEach(([type,score])=>{const row=document.createElement('div');row.className='mastery-row';const label=activities[type]?.eyebrow||type;row.innerHTML=`<span><strong>${label}</strong><small>${score>=80?'Mastered':'Keep practicing'}</small></span><strong>${score}%</strong>`;mastery.appendChild(row);});}
  if(lowest){const map={phonics:['sound','Practice beginning sounds'],spelling:['build','Practice building words'],reading:['comprehension','Practice reading'],vocabulary:['sight','Practice sight words'],pronunciation:['letter','Listen and say picture words']};byId('nextStepText').textContent=`Try this next: ${map[lowest[0]][1].toLowerCase()}. Your ${labels[lowest[0]].toLowerCase()} practice is at ${lowest[1]}%.`;byId('nextStepButton').dataset.activity=map[lowest[0]][0];byId('nextStepButton').textContent=map[lowest[0]][1];}else{byId('nextStepText').textContent='Complete a five-round activity to start building your progress.';byId('nextStepButton').dataset.activity='sound';byId('nextStepButton').textContent='Practice Sounds';}
  const mastered=Object.values(state.progress.mastery||{}).filter(v=>Number(v)>=80).length;
  if(byId('adultLevel')) byId('adultLevel').textContent=levelInfo[1];
  if(byId('adultLessons')) byId('adultLessons').textContent=state.progress.lessons||0;
  if(byId('adultMastered')) byId('adultMastered').textContent=mastered;
  ['phonics','spelling','reading','vocabulary'].forEach(skill=>{const score=scoreFor(skill);const cap=skill[0].toUpperCase()+skill.slice(1);const val=score??0;byId(`adult${cap}Bar`)?.style.setProperty('width',`${val}%`);if(byId(`adult${cap}`))byId(`adult${cap}`).textContent=score===null?'Not started':`${score}%`;});
  const allScores=['phonics','spelling','reading','vocabulary'].flatMap(skill=>state.progress[skill]); if(byId('adultTrend')) byId('adultTrend').textContent=allScores.length?'Use the first → latest comparisons in My Progress to discuss growth over time.':'Complete lessons to compare early and recent scores.';
}
function refreshJourney(){
  const stops=[...document.querySelectorAll('#journeyList [data-activity]')];
  const mastery=state.progress.mastery||{};
  let foundCurrent=false;
  stops.forEach((stop,index)=>{const score=Number(mastery[stop.dataset.activity]||0);stop.classList.remove('complete','current');const badge=stop.querySelector(':scope > span');if(score>=80){stop.classList.add('complete');if(badge)badge.textContent='✓';}else{if(!foundCurrent){stop.classList.add('current');foundCurrent=true;}if(badge)badge.textContent=String(index+1);}});
}
const levelButton=document.querySelector(`.level-card[data-level="${state.level}"]:not(.locked)`);if(levelButton){document.querySelectorAll('.level-card').forEach(b=>b.classList.remove('selected'));levelButton.classList.add('selected');}
refreshProgress();
refreshJourney();

// Stage 4: keep the current journey location visually and semantically clear.
const navScreenMap={home:'home',path:'path',resources:'resources',progress:'progress',help:'help'};
function syncPrimaryNav(screenId){
  document.querySelectorAll('.bottom-nav [data-nav]').forEach(btn=>{
    const current=navScreenMap[btn.dataset.nav]===screenId;
    if(current) btn.setAttribute('aria-current','page'); else btn.removeAttribute('aria-current');
  });
}
const originalShowScreen=showScreen;
showScreen=function(id){
  originalShowScreen(id);
  if(id==='adult') refreshProgress();
  syncPrimaryNav(id);
  const heading=document.querySelector(`#${id} h1`);
  if(heading){heading.setAttribute('tabindex','-1'); requestAnimationFrame(()=>heading.focus({preventScroll:true}));}
};
syncPrimaryNav(document.querySelector('.screen.active')?.id||'home');

// Give resource search a useful empty state instead of a blank grid.
const search=byId('resourceSearch');
if(search){
  const originalHandler=search.oninput;
  search.addEventListener('input',()=>{
    const grid=byId('resourceGrid');
    const cards=[...grid.querySelectorAll('.resource-card')];
    let empty=grid.querySelector('.empty-state');
    const visible=cards.some(card=>card.style.display!=='none');
    if(!visible){
      if(!empty){empty=document.createElement('div');empty.className='empty-state';empty.textContent='No helpers found. Try a word like “letters,” “reading,” or “rhymes.”';grid.appendChild(empty);}
    }else empty?.remove();
  });
}
