const defaults = [
  { from:'Sarria', to:'Portomarín', km:'22 km', title:'Empieza por lo que tienes', reflection:'No hace falta tener todo resuelto para dar el primer paso. La ruta comienza aquí, con lo que eres hoy: tus ganas, tus dudas y tu mochila. Caminar también es aprender a confiar en el paso siguiente.', question:'¿Qué puedes dejar atrás para caminar con más ligereza?' },
  { from:'Portomarín', to:'Palas de Rei', km:'25 km', title:'La fuerza de lo pequeño', reflection:'El camino se hace de pasos repetidos, de agua compartida y de saludos sencillos. A veces lo que sostiene una jornada no es un gran descubrimiento, sino la bondad pequeña que aparece justo a tiempo.', question:'¿Qué gesto sencillo de otra persona agradeces hoy?' },
  { from:'Palas de Rei', to:'Arzúa', km:'29 km', title:'Caminar acompañado', reflection:'Cada peregrino carga su propia historia, pero nadie recorre la senda del todo solo. Jesús se acercaba a quienes encontraba en el camino y caminaba a su lado antes de explicar nada. La compañía también puede ser una forma de esperanza.', question:'¿A quién podrías escuchar con más atención?' },
  { from:'Arzúa', to:'O Pedrouzo', km:'19 km', title:'Hacer sitio al silencio', reflection:'Cuando el paisaje se aquieta, a veces también se ordena lo que llevamos dentro. No necesitas llenar cada tramo con palabras. Deja que el silencio te alcance y nombra, sin prisa, aquello que te importa.', question:'¿Qué voz interior llevas tiempo sin escuchar?' },
  { from:'O Pedrouzo', to:'Santiago', km:'20 km', title:'Llegar y seguir en camino', reflection:'La catedral marca un final, pero el peregrino que llega ya no es exactamente quien salió. Agradece lo recibido, también lo difícil. La meta no cierra el camino: te devuelve a la vida con una mirada nueva.', question:'¿Qué te gustaría llevar contigo al volver a casa?' }
];
const config=window.CAMINO_CONFIG||{};
const editKey=decodeURIComponent((location.hash.match(/^#editar=(.+)$/)||[])[1]||'');
const editing=Boolean(editKey);
let days=JSON.parse(localStorage.getItem('buenCaminoDays')||'{}');
const stageOverrides=JSON.parse(localStorage.getItem('buenCaminoStages')||'{}');
const stages=defaults.map((s,i)=>({...s,...(stageOverrides[i]||{})}));
const list=document.querySelector('#stage-list');
const panel=document.querySelector('#reflection');
const dateInput=document.querySelector('#reading-date');
const form=document.querySelector('#day-form');
const status=document.querySelector('#day-save-status');
const localDate=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
dateInput.value=localDate;
let selectedStage=0;
function setStatus(node,message){if(node)node.textContent=message}
function renderStage(index){
  selectedStage=index;
  document.querySelectorAll('.stage-button').forEach((b,i)=>{b.classList.toggle('active',i===index);b.setAttribute('aria-pressed',i===index?'true':'false')});
  const s=stages[index];
  const label=`<p class="reflection-label">ETAPA ${String(index+1).padStart(2,'0')} · ${s.km.toUpperCase()}</p>`;
  if(editing){
    panel.innerHTML=`${label}<label class="stage-edit-label">Título<input id="stage-title"></label><label class="stage-edit-label">Reflexión<textarea id="stage-reflection" rows="5"></textarea></label><label class="stage-edit-label">Pregunta para el camino<input id="stage-question"></label><button class="button button-dark stage-save" id="stage-save">Guardar reflexión <span>✓</span></button><span class="save-status" id="stage-save-status" aria-live="polite"></span>`;
    panel.querySelector('#stage-title').value=s.title;panel.querySelector('#stage-reflection').value=s.reflection;panel.querySelector('#stage-question').value=s.question;
    panel.querySelector('#stage-save').addEventListener('click',async()=>{s.title=panel.querySelector('#stage-title').value;s.reflection=panel.querySelector('#stage-reflection').value;s.question=panel.querySelector('#stage-question').value;localStorage.setItem('buenCaminoStages',JSON.stringify(Object.fromEntries(stages.map((v,i)=>[i,{title:v.title,reflection:v.reflection,question:v.question}]))));await saveCloud();setStatus(panel.querySelector('#stage-save-status'),'Guardado.');});
  }else panel.innerHTML=`${label}<h3>${escapeHtml(s.title)}</h3><p class="reflection-text">${escapeHtml(s.reflection)}</p><div class="question"><strong>PARA LLEVAR CONTIGO</strong><p>${escapeHtml(s.question)}</p></div>`;
}
function escapeHtml(value=''){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
defaults.forEach((stage,i)=>{const b=document.createElement('button');b.className='stage-button';b.innerHTML=`<span class="stage-num">${String(i+1).padStart(2,'0')}</span><span><span class="stage-city">${stage.from} → ${stage.to}</span><span class="stage-km">${stage.km}</span></span><span class="stage-arrow">↗</span>`;b.addEventListener('click',()=>renderStage(i));list.append(b)});
function configured(){return Boolean(config.supabaseUrl&&config.anonKey)}
function snapshot(){return{stages:stages.map(({title,reflection,question})=>({title,reflection,question})),days}}
async function saveCloud(){if(!configured())return false;try{const response=await fetch(`${config.supabaseUrl.replace(/\/$/,'')}/rest/v1/rpc/guardar_camino`,{method:'POST',headers:{apikey:config.anonKey,Authorization:`Bearer ${config.anonKey}`,'Content-Type':'application/json'},body:JSON.stringify({p_clave:editKey,p_data:snapshot()})});if(!response.ok)throw new Error();return true}catch{setStatus(status,'No se pudo sincronizar. Comprueba la conexión y la configuración.');return false}}
function updateReading(){const date=dateInput.value||localDate;const d=days[date]||{};document.querySelector('#reading-day').textContent=new Intl.DateTimeFormat('es-ES',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(`${date}T12:00:00`));document.querySelector('#reading-reference').textContent=d.reference||'Lectura del día';document.querySelector('.reading-caption').textContent=d.reference?'Lectura del santo Evangelio según '+(d.evangelist||''):'';document.querySelector('#reading-text').textContent=d.gospelText||'';document.querySelector('#first-reading').textContent=d.first?`Primera lectura: ${d.first}`:'';document.querySelector('#separator-one').hidden=!d.first;document.querySelector('#separator-two').hidden=!(d.first&&d.psalm);document.querySelector('#psalm-reading').textContent=d.psalm?`Salmo: ${d.psalm}`:'';document.querySelector('#reading-link').href=`https://www.ewtn.com/es/lecturas/${date}`;for(const name of ['reference','evangelist','gospelText','first','psalm','reflection'])form.elements[name].value=d[name]||'';if(d.reflection)document.querySelector('#daily-reflection').textContent=d.reflection;else document.querySelector('#daily-reflection').textContent='';}
function applyState(data){if(!data)return;if(Array.isArray(data.stages))data.stages.forEach((saved,i)=>{if(stages[i])Object.assign(stages[i],saved)});days=data.days||{};renderStage(selectedStage);updateReading()}
async function loadCloud(){if(!configured()){setStatus(status,editing?'Falta configurar el almacenamiento compartido.':'');return}try{const url=config.supabaseUrl.replace(/\/$/,'');const response=await fetch(`${url}/rest/v1/camino_state?id=eq.1&select=data`,{headers:{apikey:config.anonKey,Authorization:`Bearer ${config.anonKey}`}});if(!response.ok)throw new Error();const rows=await response.json();if(rows[0]?.data)applyState(rows[0].data);if(editing)setStatus(status,'Cambios sincronizados en la nube.')}catch{setStatus(status,'No se pudieron cargar los contenidos compartidos.')}}
if(!editing){document.querySelector('#day-editor').hidden=true;document.querySelectorAll('.stage-edit-label,.stage-save').forEach(el=>el.hidden=true)}
document.querySelector('#daily-reflection-wrap').hidden=!editing;
form.addEventListener('submit',async event=>{event.preventDefault();const d={};for(const field of ['reference','evangelist','gospelText','first','psalm','reflection'])d[field]=form.elements[field].value.trim();days[dateInput.value]=d;localStorage.setItem('buenCaminoDays',JSON.stringify(days));updateReading();setStatus(status,'Guardando…');const ok=await saveCloud();setStatus(status,ok?'Guardado y compartido.':configured()?'No se pudo guardar en la nube.':'Configuración de nube pendiente.');});
dateInput.addEventListener('change',updateReading);
renderStage(0);updateReading();loadCloud();
