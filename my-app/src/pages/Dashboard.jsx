import { useState, useEffect, useRef } from "react";

const SEED = [
  { id: 1,  name: "Санхүүгийн тайлан хоцрогдол",       type: "Хугацаа хэтрэх",          severity: "high",     date: "2025-01-10", status: "progress" },
  { id: 2,  name: "ATM техник эвдрэл",                  type: "Тоног төхөөрөмж",          severity: "critical", date: "2025-01-08", status: "new"      },
  { id: 3,  name: "HR бүртгэлийн алдаа",                type: "Журам зөрчих",             severity: "low",      date: "2025-01-12", status: "done"     },
  { id: 4,  name: "Борлуулалтын тайлан дутуу",          type: "Тайлагнал",                severity: "mid",      date: "2025-01-05", status: "progress" },
  { id: 5,  name: "МТ сүлжээний тасалдал",              type: "Технологи",                severity: "high",     date: "2025-01-09", status: "new"      },
  { id: 6,  name: "Маркетинг зардлын хэтрэлт",          type: "Санхүү",                   severity: "mid",      date: "2025-01-07", status: "done"     },
  { id: 7,  name: "Үйл ажиллагааны зөрчил",             type: "Журам зөрчих",             severity: "low",      date: "2025-01-11", status: "new"      },
  { id: 8,  name: "Чанарын стандарт зөрчих",            type: "Чанар",                    severity: "high",     date: "2025-01-06", status: "progress" },
  { id: 9,  name: "ХАБЭА сургалт хоцрогдол",            type: "Аюулгүй байдал",           severity: "mid",      date: "2025-01-03", status: "done"     },
  { id: 10, name: "Гэрээний нөхцөл зөрчил",             type: "Хуулийн",                  severity: "critical", date: "2025-01-02", status: "new"      },
  { id: 11, name: "Дотоод аудитын дутагдал",            type: "Аудит",                    severity: "mid",      date: "2025-01-13", status: "progress" },
  { id: 12, name: "Хэрэглэгчийн мэдээлэл алдагдал",    type: "Мэдээлэл аюулгүй байдал", severity: "critical", date: "2024-12-28", status: "done"     },
  { id: 13, name: "Борлуулалтын зорилт биелэгдсэнгүй", type: "Гүйцэтгэл",               severity: "mid",      date: "2024-12-20", status: "new"      },
  { id: 14, name: "Ажилтны ёс зүйн зөрчил",            type: "Журам зөрчих",             severity: "high",     date: "2024-12-15", status: "done"     },
];

const SEV_MAP  = { low: ["c-low","Бага"], mid: ["c-mid","Дунд"], high: ["c-high","Өндөр"], critical: ["c-critical","Маш өндөр"] };
const STAT_MAP = { new: ["c-new","Шинэ"], progress: ["c-progress","Явцтай"], done: ["c-done","Дууссан"] };
const PER = 12;

function today() { return new Date().toISOString().split("T")[0]; }
function cntArr(arr, k, v) { return arr.filter(x => x[k] === v).length; }

function SevChip({ s }) {
  const [cls, lbl] = SEV_MAP[s] || SEV_MAP.low;
  return <span className={`chip ${cls}`}>{lbl}</span>;
}
function StatChip({ s }) {
  const [cls, lbl] = STAT_MAP[s] || STAT_MAP.new;
  return <span className={`chip ${cls}`}>{lbl}</span>;
}

function BarChart({ data }) {
  const ref = useRef();
  useEffect(() => {
    const canvas = ref.current; if (!canvas || !data.length) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const pad = { t:24, r:10, b:50, l:30 };
    const cW = W-pad.l-pad.r, cH = H-pad.t-pad.b;
    ctx.clearRect(0,0,W,H);
    const types = [...new Set(data.map(x=>x.type))].slice(0,7);
    const sevs = ["critical","high","mid","low"];
    const colors = { critical:"#ef5350", high:"#ff7043", mid:"#ffa000", low:"#43a047" };
    const maxVal = Math.max(...types.map(t=>data.filter(x=>x.type===t).length),1);
    const barW = Math.max(20, cW/types.length*0.55);
    const gap = cW/types.length;
    ctx.strokeStyle="#f0f0f0"; ctx.lineWidth=1;
    [0,0.25,0.5,0.75,1].forEach(t=>{const y=pad.t+cH*t;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(W-pad.r,y);ctx.stroke();});
    types.forEach((t,i)=>{
      const x=pad.l+i*gap+gap/2-barW/2; let yOff=0;
      sevs.forEach(sev=>{
        const c=data.filter(x=>x.type===t&&x.severity===sev).length; if(!c)return;
        const h=(c/maxVal)*cH, y=pad.t+cH-yOff-h;
        ctx.fillStyle=colors[sev]; ctx.beginPath();
        if(ctx.roundRect)ctx.roundRect(x,y,barW,h,3); else ctx.rect(x,y,barW,h);
        ctx.fill(); yOff+=h;
      });
      ctx.fillStyle="#999"; ctx.font="10px Arial"; ctx.textAlign="center";
      ctx.fillText(t.length>9?t.slice(0,9)+"…":t, pad.l+i*gap+gap/2, H-8);
    });
    ctx.strokeStyle="#e8e8e8"; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(pad.l,pad.t); ctx.lineTo(pad.l,pad.t+cH); ctx.stroke();
    [["Маш өндөр","#ef5350"],["Өндөр","#ff7043"],["Дунд","#ffa000"],["Бага","#43a047"]].forEach(([l,c],i)=>{
      ctx.fillStyle=c; ctx.fillRect(pad.l+i*90,4,10,8);
      ctx.fillStyle="#555"; ctx.font="10px Arial"; ctx.textAlign="left"; ctx.fillText(l,pad.l+i*90+13,12);
    });
  }, [data]);
  return <canvas ref={ref} width={500} height={200} style={{width:"100%",height:"200px"}} />;
}

function DoughnutChart({ data }) {
  const ref = useRef();
  useEffect(()=>{
    const canvas=ref.current; if(!canvas)return;
    const ctx=canvas.getContext("2d"); const W=canvas.width,H=canvas.height;
    const nw=cntArr(data,"status","new"),pr=cntArr(data,"status","progress"),dn=cntArr(data,"status","done");
    const total=nw+pr+dn||1; const vals=[nw,pr,dn]; const clrs=["#1e88e5","#ffa000","#43a047"];
    const cx=W/2,cy=H/2-18,r=Math.min(cx,cy-10)-10,inner=r*0.55;
    ctx.clearRect(0,0,W,H); let ang=-Math.PI/2;
    vals.forEach((v,i)=>{const slice=(v/total)*2*Math.PI;ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,ang,ang+slice);ctx.closePath();ctx.fillStyle=clrs[i];ctx.fill();ang+=slice;});
    ctx.beginPath();ctx.arc(cx,cy,inner,0,2*Math.PI);ctx.fillStyle="#fff";ctx.fill();
    ctx.font="bold 24px Arial";ctx.fillStyle="#1a2d45";ctx.textAlign="center";ctx.fillText(total,cx,cy+8);
    ctx.font="11px Arial";ctx.fillStyle="#999";ctx.fillText("Нийт",cx,cy+24);
    ["Шинэ","Явцтай","Дууссан"].forEach((l,i)=>{
      const lx=8+i*(W/3);ctx.fillStyle=clrs[i];ctx.beginPath();ctx.arc(lx+6,H-12,5,0,2*Math.PI);ctx.fill();
      ctx.fillStyle="#555";ctx.font="11px Arial";ctx.textAlign="left";ctx.fillText(`${l} (${vals[i]})`,lx+14,H-8);
    });
  },[data]);
  return <canvas ref={ref} width={280} height={220} style={{width:"100%",height:"220px"}} />;
}

function LineChart({ data }) {
  const ref = useRef();
  useEffect(()=>{
    const canvas=ref.current; if(!canvas)return;
    const ctx=canvas.getContext("2d"); const W=canvas.width,H=canvas.height;
    const total=data.length,dn=cntArr(data,"status","done");
    const months=["1-р","2-р","3-р","4-р","5-р","6-р"];
    const ds=[{d:[8,12,7,15,10,total],clr:"#1e88e5",fill:"rgba(30,136,229,.1)",lbl:"Нийт"},{d:[3,7,4,9,6,dn],clr:"#43a047",fill:"rgba(67,160,71,.08)",lbl:"Шийдсэн"}];
    const pad={t:24,r:16,b:36,l:30}; const cW=W-pad.l-pad.r,cH=H-pad.t-pad.b;
    const maxV=Math.max(...ds.flatMap(x=>x.d),1); ctx.clearRect(0,0,W,H);
    ctx.strokeStyle="#f0f0f0";ctx.lineWidth=1;
    [0,0.25,0.5,0.75,1].forEach(t=>{const y=pad.t+cH*t;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(W-pad.r,y);ctx.stroke();});
    ds.forEach(({d,clr,fill})=>{
      const pts=d.map((v,i)=>[pad.l+i*(cW/(d.length-1)),pad.t+cH-(v/maxV)*cH]);
      ctx.beginPath();pts.forEach(([x,y],i)=>i===0?ctx.moveTo(x,y):ctx.lineTo(x,y));ctx.strokeStyle=clr;ctx.lineWidth=2;ctx.stroke();
      ctx.beginPath();pts.forEach(([x,y],i)=>i===0?ctx.moveTo(x,y):ctx.lineTo(x,y));ctx.lineTo(pts[pts.length-1][0],pad.t+cH);ctx.lineTo(pts[0][0],pad.t+cH);ctx.closePath();ctx.fillStyle=fill;ctx.fill();
      pts.forEach(([x,y])=>{ctx.beginPath();ctx.arc(x,y,3,0,2*Math.PI);ctx.fillStyle=clr;ctx.fill();});
    });
    ctx.fillStyle="#999";ctx.font="10px Arial";ctx.textAlign="center";
    months.forEach((m,i)=>ctx.fillText(m+"сар",pad.l+i*(cW/(months.length-1)),H-6));
    ds.forEach(({clr,lbl},i)=>{ctx.fillStyle=clr;ctx.fillRect(pad.l+i*80,6,12,8);ctx.fillStyle="#555";ctx.font="10px Arial";ctx.textAlign="left";ctx.fillText(lbl,pad.l+i*80+15,14);});
  },[data]);
  return <canvas ref={ref} width={400} height={190} style={{width:"100%",height:"190px"}} />;
}

function Modal({ open, title, initial, onSave, onClose }) {
  const [form, setForm] = useState(initial);
  useEffect(()=>setForm(initial),[initial]);
  if(!open)return null;
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  return(
    <div className="overlay open" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-title">{title}</div>
        <div className="fg">
          <div className="fl fg-full"><label>Нэр / Хариуцагч</label><input value={form.name||""} onChange={e=>set("name",e.target.value)} placeholder="Зөрчлийн нэр…" /></div>
          <div className="fl fg-full"><label>Зөрчлийн төрөл</label><input value={form.type||""} onChange={e=>set("type",e.target.value)} placeholder="Журам зөрчих, Хугацаа хэтрэх…" /></div>
          <div className="fl"><label>Эрсдэлийн зэрэг</label><select value={form.severity||"low"} onChange={e=>set("severity",e.target.value)}><option value="low">Бага</option><option value="mid">Дунд</option><option value="high">Өндөр</option><option value="critical">Маш өндөр</option></select></div>
          <div className="fl"><label>Огноо</label><input type="date" value={form.date||""} onChange={e=>set("date",e.target.value)} /></div>
          <div className="fl fg-full"><label>Төлөв</label><select value={form.status||"new"} onChange={e=>set("status",e.target.value)}><option value="new">Шинэ</option><option value="progress">Явцтай</option><option value="done">Дууссан</option></select></div>
        </div>
        <div className="m-footer">
          <button className="btn b-ghost" onClick={onClose}>Болих</button>
          <button className="btn b-cyan" onClick={()=>onSave(form)}>Хадгалах</button>
        </div>
      </div>
    </div>
  );
}

function doExportCSV(data) {
  const hdr=["#","Нэр","Төрөл","Эрсдэл","Огноо","Төлөв"];
  const rows=data.map((r,i)=>[i+1,r.name,r.type,r.severity,r.date,r.status]);
  const csv=[hdr,...rows].map(r=>r.map(c=>`"${c}"`).join(",")).join("\n");
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8;"}));
  a.download="violations.csv"; document.body.appendChild(a); a.click(); a.remove();
}

export default function Dashboard({ user, onLogout }) {
  const [tab, setTab]       = useState("dashboard");
  const [data, setData]     = useState(SEED.map(x=>({...x})));
  const [search, setSearch] = useState("");
  const [fSev, setFSev]     = useState("");
  const [fStat, setFStat]   = useState("");
  const [pg, setPg]         = useState(1);
  const [modal, setModal]   = useState({ open:false, title:"", initial:{name:"",type:"",severity:"low",date:today(),status:"new"}, editId:null });
  const [toast, setToast]   = useState({ msg:"", type:"ok" });
  const [email, setEmail]   = useState({ to:"", subj:"", body:"" });

  function showToast(msg, type="ok") { setToast({msg,type}); setTimeout(()=>setToast({msg:"",type:"ok"}),3000); }

  const filtered = data.filter(x=>
    (!search||x.name.toLowerCase().includes(search.toLowerCase())||x.type.toLowerCase().includes(search.toLowerCase()))&&
    (!fSev||x.severity===fSev)&&(!fStat||x.status===fStat)
  );
  const pages = Math.ceil(filtered.length/PER)||1;
  const slice = filtered.slice((pg-1)*PER, pg*PER);

  function openAdd() { setModal({open:true,title:"Зөрчил нэмэх",initial:{name:"",type:"",severity:"low",date:today(),status:"new"},editId:null}); }
  function openEdit(id) { const row=data.find(x=>x.id===id); setModal({open:true,title:"Зөрчил засварлах",initial:{...row},editId:id}); }
  function saveV(form) {
    if(!form.name?.trim()||!form.type?.trim()||!form.date){showToast("Бүх талбарыг бөглөнө үү","err");return;}
    if(modal.editId){setData(d=>d.map(x=>x.id===modal.editId?{...x,...form}:x));showToast("Амжилттай засварлагдлаа ✅");}
    else{setData(d=>[...d,{id:Date.now(),...form}]);showToast("Амжилттай нэмэгдлээ ✅");}
    setModal(m=>({...m,open:false}));
  }
  function delV(id) {
    if(!confirm("Устгахдаа итгэлтэй байна уу?"))return;
    setData(d=>d.filter(x=>x.id!==id)); showToast("Амжилттай устгагдлаа 🗑");
  }
  function emailTemplate() {
    setEmail({to:email.to,subj:"Зөрчлийн мэдэгдэл — Хяналтын Систем",
      body:`Хүндэт хариуцагч,\n\nТайлант хугацааны зөрчлийн мэдэгдлийг хүргэж байна.\n\nНийт зөрчил     : ${data.length}\nШийдвэрлэж буй: ${cntArr(data,"status","progress")}\nДууссан          : ${cntArr(data,"status","done")}\nШинэ             : ${cntArr(data,"status","new")}\n\nДэлгэрэнгүйг системд нэвтэрч харна уу.\n\nХүндэтгэлтэй,\nХяналтын Систем`});
  }
  function sendEmail() {
    if(!email.to||!email.subj||!email.body){showToast("Бүх талбарыг бөглөнө үү","err");return;}
    showToast("Имэйл амжилттай илгээгдлээ ✉️");
  }

  const TITLE = { dashboard:"Ерөнхий тойм", violations:"Бүх зөрчил", email:"Имэйл илгээх" };

  return (
    // KEY FIX: position:absolute, inset:0 — дэлгэцийг бүрэн дүүргэнэ
    <div style={{position:"absolute",inset:0,display:"flex",overflow:"hidden"}}>

      {/* ══ SIDEBAR ══ */}
      <div className="sidebar">
        <div className="sb-brand">
          <div className="sb-brand-icon">📋</div>
          <div className="sb-brand-text">Хяналтын Самбар</div>
        </div>
        <div className="sb-section">ҮНДСЭН</div>
        <div className={`sb-item${tab==="dashboard"?" on":""}`} onClick={()=>setTab("dashboard")}>
          <span className="sb-icon">📊</span> Тайлан
        </div>
        <div className={`sb-item${tab==="violations"?" on":""}`} onClick={()=>setTab("violations")}>
          <span className="sb-icon">📋</span> Бүх зөрчил
          <span className="sb-badge">{data.length}</span>
        </div>
        <div className="sb-section">СИСТЕМ</div>
        <div className={`sb-item${tab==="email"?" on":""}`} onClick={()=>setTab("email")}>
          <span className="sb-icon">✉️</span> Имэйл илгээх
        </div>
        <div className="sb-bottom">
          <div className="sb-item" onClick={onLogout}>
            <span className="sb-icon">🚪</span> Системээс гарах
          </div>
        </div>
      </div>

      {/* ══ MAIN ══ */}
      <div className="main">
        <div className="topbar">
          <div className="topbar-crumb">Нүүр / <b>{TITLE[tab]}</b></div>
          <div className="topbar-right">
            <span className="t-user">{user?.username}</span>
            <span className="t-role">{user?.role}</span>
            <button className="t-logout" onClick={onLogout}>Гарах</button>
          </div>
        </div>

        <div className="content">

          {/* ── DASHBOARD TAB ── */}
          {tab==="dashboard" && (
            <div className="sec on">
              <div className="sec-crumb">Нүүр / <b>Ерөнхий тойм</b></div>
              <div className="stats">
                <div className="stat s-cyan"><div className="stat-n">{data.length}</div><div className="stat-l">Нийт зөрчил</div></div>
                <div className="stat s-red"><div className="stat-n">{cntArr(data,"severity","critical")}</div><div className="stat-l">Маш өндөр эрсдэл</div></div>
                <div className="stat s-orange"><div className="stat-n">{cntArr(data,"severity","high")}</div><div className="stat-l">Өндөр эрсдэл</div></div>
                <div className="stat s-amber"><div className="stat-n">{cntArr(data,"status","progress")}</div><div className="stat-l">Явцтай</div></div>
                <div className="stat s-green"><div className="stat-n">{cntArr(data,"status","done")}</div><div className="stat-l">Дууссан</div></div>
              </div>
              <div className="charts-row">
                <div className="chart-card"><div className="chart-title">Төрлөөр ангилсан зөрчил</div><BarChart data={data} /></div>
                <div className="chart-card"><div className="chart-title">Төлвийн харьцаа</div><DoughnutChart data={data} /></div>
                <div className="chart-card"><div className="chart-title">Сарын хандлага</div><LineChart data={data} /></div>
              </div>
              <div style={{display:"flex",gap:9,marginTop:4}}>
                <button className="btn b-green" onClick={()=>doExportCSV(data)}>⬇ CSV татах</button>
              </div>
            </div>
          )}

          {/* ── VIOLATIONS TAB ── */}
          {tab==="violations" && (
            <div className="sec on">
              <div className="sec-crumb">Нүүр / <b>Бүх зөрчил</b></div>
              <div className="toolbar">
                <input className="t-search" placeholder="🔍 Нэр, төрлөөр хайх…" value={search} onChange={e=>{setSearch(e.target.value);setPg(1);}} />
                <select className="t-filter" value={fSev} onChange={e=>{setFSev(e.target.value);setPg(1);}}>
                  <option value="">Эрсдэл — бүгд</option><option value="low">Бага</option><option value="mid">Дунд</option><option value="high">Өндөр</option><option value="critical">Маш өндөр</option>
                </select>
                <select className="t-filter" value={fStat} onChange={e=>{setFStat(e.target.value);setPg(1);}}>
                  <option value="">Төлөв — бүгд</option><option value="new">Шинэ</option><option value="progress">Явцтай</option><option value="done">Дууссан</option>
                </select>
                <button className="btn b-green" onClick={()=>doExportCSV(data)}>⬇ CSV</button>
                <button className="btn b-cyan" onClick={openAdd}>＋ Нэмэх</button>
              </div>
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>#</th><th>Нэр / Хариуцагч</th><th>Төрөл</th><th>Эрсдэл</th><th>Огноо</th><th>Төлөв</th><th>Үйлдэл</th></tr></thead>
                  <tbody>
                    {!slice.length
                      ? <tr className="empty-row"><td colSpan={7}>📭 Мэдээлэл олдсонгүй</td></tr>
                      : slice.map((row,i)=>(
                        <tr key={row.id}>
                          <td style={{color:"#bbb",fontSize:12}}>{(pg-1)*PER+i+1}</td>
                          <td><strong>{row.name}</strong></td>
                          <td style={{color:"#666",fontSize:"12.5px"}}>{row.type}</td>
                          <td><SevChip s={row.severity} /></td>
                          <td style={{fontFamily:"monospace",fontSize:12}}>{row.date}</td>
                          <td><StatChip s={row.status} /></td>
                          <td><div className="row-acts">
                            <button className="btn b-amber btn-sm" onClick={()=>openEdit(row.id)}>✏ Засах</button>
                            {user?.role==="Admin"&&<button className="btn b-red btn-sm" onClick={()=>delV(row.id)}>🗑</button>}
                          </div></td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
              <div className="pg">
                <span className="pg-info">Нийт {filtered.length} зөрчил</span>
                {Array.from({length:pages},(_,i)=>i+1).map(n=>(
                  <button key={n} className={`pg-btn${n===pg?" on":""}`} onClick={()=>setPg(n)}>{n}</button>
                ))}
              </div>
            </div>
          )}

          {/* ── EMAIL TAB ── */}
          {tab==="email" && (
            <div className="sec on">
              <div className="sec-crumb">Нүүр / <b>Имэйл илгээх</b></div>
              <div className="email-wrap">
                <div className="email-card">
                  <h2>✉️ Имэйл илгээх</h2>
                  <p>Хариуцагч болон удирдлагад мэдэгдэл илгээнэ үү</p>
                  <div className="fl" style={{marginBottom:13}}><label>Хүлээн авагч (To)</label><input type="email" placeholder="example@company.mn" value={email.to} onChange={e=>setEmail(em=>({...em,to:e.target.value}))} /></div>
                  <div className="fl" style={{marginBottom:13}}><label>Гарчиг (Subject)</label><input type="text" placeholder="Зөрчлийн мэдэгдэл" value={email.subj} onChange={e=>setEmail(em=>({...em,subj:e.target.value}))} /></div>
                  <div className="fl" style={{marginBottom:20}}><label>Агуулга</label><textarea placeholder="Имэйлийн агуулга…" value={email.body} onChange={e=>setEmail(em=>({...em,body:e.target.value}))} /></div>
                  <div style={{display:"flex",gap:9}}>
                    <button className="btn b-cyan" onClick={sendEmail}>✈ Илгээх</button>
                    <button className="btn b-ghost" onClick={emailTemplate}>📄 Загвар</button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      <Modal open={modal.open} title={modal.title} initial={modal.initial} onSave={saveV} onClose={()=>setModal(m=>({...m,open:false}))} />
      {toast.msg&&<div className={`toast show t-${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}