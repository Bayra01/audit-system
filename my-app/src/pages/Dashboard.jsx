import { useState, useEffect, useRef } from "react";
// 1. AuthContext-ээс useAuth-ийг импортлох
import { useAuth } from "../context/AuthContext"; 

// ... (SEED, SEV_MAP, STAT_MAP, BarChart, DoughnutChart, LineChart, Modal функцүүд хэвээрээ үлдэнэ)

// ════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  // 2. Prop-оор биш useAuth hook-ээр хэрэглэгчийн мэдээлэл болон signOut-ийг авна
  const { user, signOut } = useAuth(); 

  const [tab, setTab]         = useState("dashboard");
  const [data, setData]       = useState(SEED.map(x=>({...x})));
  const [search, setSearch]   = useState("");
  const [fSev, setFSev]       = useState("");
  const [fStat, setFStat]     = useState("");
  const [pg, setPg]           = useState(1);
  const [modal, setModal]     = useState({ open:false, title:"", initial:{name:"",type:"",severity:"low",date:today(),status:"new"}, editId:null });
  const [toast, setToast]     = useState({ msg:"", type:"ok" });
  const [email, setEmail]     = useState({ to:"", subj:"", body:"" });

  // ... (showToast, filtered, saveV, delV, emailTemplate, sendEmail функцүүд хэвээрээ)

  const TITLE = { dashboard:"Ерөнхий тойм", violations:"Бүх зөрчил", email:"Имэйл илгээх" };

  return (
    <div style={{display:"flex",height:"100vh",width:"100vw",overflow:"hidden",fontFamily:"Arial, Helvetica, sans-serif",position:"fixed",top:0,left:0}}>

      {/* ══ SIDEBAR ══ */}
      <div className="sidebar" style={{display:"flex",flexDirection:"column",width:245,minWidth:245,background:"#1a2d45",color:"#fff",flexShrink:0,overflowY:"auto"}}>
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
          {/* 3. onLogout-ийн оронд signOut-ийг дуудна */}
          <div className="sb-item" onClick={signOut}>
            <span className="sb-icon">🚪</span> Системээс гарах
          </div>
        </div>
      </div>

      {/* ══ MAIN ══ */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",background:"#eef0f5"}}>

        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-crumb">Нүүр / <b>{TITLE[tab]}</b></div>
          <div className="topbar-right">
            {/* 4. Хэрэглэгчийн мэдээллийг контекстоос харуулна */}
            <span className="t-user">{user?.username}</span>
            <span className="t-role">{user?.role}</span>
            <button className="t-logout" onClick={signOut}>Гарах</button>
          </div>
        </div>

        <div className="content">
          {/* ... (Dashboard, Violations, Email табуудын доторх код хэвээрээ) */}
        </div>
      </div>

      {/* ... (Modal болон Toast хэсэг хэвээрээ) */}
    </div>
  );
}