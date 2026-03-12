"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const AC = "#4f6ef7"; const ACL = "#eef1fe"; const PG = "#f0f2f5"; const CB = "#ffffff";
const BD = "#e5e8ef"; const TP = "#1a1f2e"; const TS = "#6b7280"; const TM = "#9ca3af";
const GR = "#22c55e"; const GL = "#dcfce7"; const AM = "#f59e0b"; const AL = "#fef3c7";
const RD = "#ef4444"; const RL = "#fee2e2"; const PU = "#8b5cf6"; const PL = "#ede9fe";
const OR = "#f97316"; const OL = "#ffedd5";
const F = "'Inter', system-ui, sans-serif";
const bP = { padding:"8px 18px", borderRadius:7, fontSize:13, cursor:"pointer", fontFamily:F, fontWeight:600, background:AC, color:"#fff", border:"none", whiteSpace:"nowrap" };
const bS = { padding:"8px 18px", borderRadius:7, fontSize:13, cursor:"pointer", fontFamily:F, fontWeight:500, background:"#fff", color:TS, border:`1px solid ${BD}`, whiteSpace:"nowrap" };
const iS = { width:"100%", background:"#fff", border:`1px solid ${BD}`, borderRadius:7, color:TP, padding:"8px 12px", fontSize:13, fontFamily:F, display:"block" };

const ROLES = [
  { id:"super_admin",  label:"Super Admin",       color:RD, light:RL, desc:"Full system access" },
  { id:"doc_admin",    label:"Doc Administrator", color:AC, light:ACL, desc:"Create, edit and publish all templates" },
  { id:"doc_editor",   label:"Doc Editor",        color:PU, light:PL, desc:"Edit templates, cannot publish" },
  { id:"doc_viewer",   label:"Doc Viewer",        color:TS, light:"#f3f4f6", desc:"Read-only access" },
  { id:"workflow_mgr", label:"Workflow Manager",  color:OR, light:OL, desc:"Configure automation workflows" },
  { id:"approver",     label:"Approver",          color:GR, light:GL, desc:"Approve templates and bulk jobs" },
];

const PMATRIX = [
  { f:"Template Library",  super_admin:"full",doc_admin:"full",doc_editor:"edit",doc_viewer:"view",workflow_mgr:"view",approver:"view" },
  { f:"Create Templates",  super_admin:"full",doc_admin:"full",doc_editor:"full",doc_viewer:"none",workflow_mgr:"none",approver:"none" },
  { f:"Publish Templates", super_admin:"full",doc_admin:"full",doc_editor:"none",doc_viewer:"none",workflow_mgr:"none",approver:"none" },
  { f:"Approve Templates", super_admin:"full",doc_admin:"full",doc_editor:"none",doc_viewer:"none",workflow_mgr:"none",approver:"full" },
  { f:"Bulk Generation",   super_admin:"full",doc_admin:"full",doc_editor:"none",doc_viewer:"none",workflow_mgr:"full",approver:"none" },
  { f:"Distribute/Send",   super_admin:"full",doc_admin:"full",doc_editor:"none",doc_viewer:"none",workflow_mgr:"full",approver:"none" },
  { f:"Workflow & Rules",  super_admin:"full",doc_admin:"view",doc_editor:"none",doc_viewer:"none",workflow_mgr:"full",approver:"none" },
  { f:"eSignature",        super_admin:"full",doc_admin:"full",doc_editor:"view",doc_viewer:"view",workflow_mgr:"view",approver:"view" },
  { f:"Integrations",      super_admin:"full",doc_admin:"view",doc_editor:"none",doc_viewer:"none",workflow_mgr:"view",approver:"none" },
  { f:"Analytics",         super_admin:"full",doc_admin:"full",doc_editor:"view",doc_viewer:"view",workflow_mgr:"view",approver:"view" },
  { f:"Security Settings", super_admin:"full",doc_admin:"none",doc_editor:"none",doc_viewer:"none",workflow_mgr:"none",approver:"none" },
  { f:"User Admin",        super_admin:"full",doc_admin:"none",doc_editor:"none",doc_viewer:"none",workflow_mgr:"none",approver:"none" },
];

const INIT_USERS = [
  { id:1, name:"Sarah Kent",     email:"s.kent@rdtltd.com",     role:"doc_admin",    dept:"Operations", status:"Active",   lastLogin:"Today 09:41", mfa:true  },
  { id:2, name:"James Thomas",   email:"j.thomas@rdtltd.com",   role:"doc_editor",   dept:"Operations", status:"Active",   lastLogin:"Today 08:55", mfa:true  },
  { id:3, name:"Emma Reynolds",  email:"e.reynolds@rdtltd.com", role:"approver",     dept:"Compliance", status:"Active",   lastLogin:"Yesterday",   mfa:true  },
  { id:4, name:"David Mitchell", email:"d.mitchell@rdtltd.com", role:"workflow_mgr", dept:"IT",         status:"Active",   lastLogin:"Today 07:30", mfa:false },
  { id:5, name:"Rachel Green",   email:"r.green@rdtltd.com",    role:"doc_viewer",   dept:"Finance",    status:"Active",   lastLogin:"2 days ago",  mfa:true  },
  { id:6, name:"Tom Bradley",    email:"t.bradley@rdtltd.com",  role:"doc_editor",   dept:"Operations", status:"Inactive", lastLogin:"3 weeks ago", mfa:false },
  { id:7, name:"Lisa Patel",     email:"l.patel@rdtltd.com",    role:"approver",     dept:"Compliance", status:"Active",   lastLogin:"Today 09:10", mfa:true  },
  { id:8, name:"Admin Account",  email:"admin@rdtltd.com",      role:"super_admin",  dept:"IT",         status:"Active",   lastLogin:"Today 06:00", mfa:true  },
];

const TEMPLATES = [
  { id:1, name:"Policy Renewal Notice",  type:"Letter", cat:"Renewals",      status:"Active",   ver:"v3.2", mod:"2 hrs ago",   uses:1240 },
  { id:2, name:"Claims Acknowledgement", type:"Email",  cat:"Claims",        status:"Active",   ver:"v1.8", mod:"1 day ago",   uses:890  },
  { id:3, name:"NCD Certificate",        type:"PDF",    cat:"Certificates",  status:"Draft",    ver:"v2.0", mod:"3 days ago",  uses:0    },
  { id:4, name:"Welcome Pack – Motor",   type:"Bundle", cat:"Onboarding",    status:"Active",   ver:"v4.1", mod:"1 week ago",  uses:4520 },
  { id:5, name:"MTA Endorsement Letter", type:"Letter", cat:"Endorsements",  status:"Review",   ver:"v1.3", mod:"2 weeks ago", uses:340  },
  { id:6, name:"Cancellation Notice",    type:"Letter", cat:"Cancellations", status:"Active",   ver:"v2.7", mod:"3 weeks ago", uses:215  },
];

const CHANNELS = [
  { id:"print", label:"Central Print",   icon:"🖨️" },
  { id:"email", label:"Email",           icon:"✉️" },
  { id:"sms",   label:"SMS",             icon:"💬" },
  { id:"wa",    label:"WhatsApp",        icon:"__WA__" },
  { id:"portal",label:"Customer Portal", icon:"🌐" },
];

const WORKFLOWS = [
  { name:"Renewal Dispatch — Motor",  trigger:"60 days before expiry", steps:5, status:"Active", lastRun:"Today 06:00",  vol:"4,200/day" },
  { name:"New Business Welcome Pack", trigger:"Policy inception",       steps:3, status:"Active", lastRun:"Continuous",   vol:"850/day"   },
  { name:"Claims First Contact",      trigger:"Claim registered",       steps:4, status:"Active", lastRun:"Continuous",   vol:"180/day"   },
  { name:"MTA Confirmation",          trigger:"Policy amendment",       steps:2, status:"Active", lastRun:"Continuous",   vol:"320/day"   },
  { name:"Annual Statement",          trigger:"Scheduled — Jan 1",      steps:6, status:"Paused", lastRun:"Jan 1, 2026",  vol:"Batch only"},
];

const INTGS = [
  { name:"PAS / CAS Core",      status:"Connected", icon:"🏛️", sync:"2 min ago",  recs:"124,500" },
  { name:"ACE Platform",        status:"Connected", icon:"⚡",  sync:"5 min ago",  recs:"88,200"  },
  { name:"Salesforce CRM",      status:"Connected", icon:"☁️", sync:"15 min ago", recs:"42,100"  },
  { name:"DocuSign",            status:"Connected", icon:"✍️", sync:"Live",       recs:"—"       },
  { name:"Twilio SMS",          status:"Connected", icon:"📡", sync:"Live",       recs:"—"       },
  { name:"AWS S3 Storage",      status:"Connected", icon:"🗄️", sync:"Live",       recs:"2.4 TB"  },
];

const RDT_LOGO = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCADSAZADASIAAhEBAxEB/8QAHQABAAICAwEBAAAAAAAAAAAAAAgJBgcDBAUBAv/EAFEQAAEDAgMEAggSCAUDBQAAAAEAAgMEBQYHEQgSITFBURMiOFZhcYGRFBUXGDI0N2Jyc3WUobKztMHSIzNCUnSCsdEJFjWT00OSwmNkw+Hw/8QAGwEBAQEAAwEBAAAAAAAAAAAAAAEGAgMFBwT/xAAzEQACAQMBBwEHAwQDAAAAAAAAAQIDBBEFBhIhMUFRYYETFCJxkaHwscHRFRYj4TJC8f/aAAwDAQACEQMRAD8AmWiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIuGvqoqKhnrKh27DBG6WQ9TWjU/QFG0lllScnhHMii7i3HmIcQ18k7rhU0lKXfoaaCUsaxvRrppvHrJXt5XZhXe2X2lt90rpqy21MjYXCd5e6EuOgc1x46akajqWZp7U2066p7rUW8Z/12NZV2Qu6du6u8nJLO7/AL7kh0RFpzJBFoTOLHl1qMQVVitdZLR0VG/sUphcWvmkHstXDjug8NB1HVYbhzF2IbDXMqqG5VDgHavhlkc+OQdRBP0jiFmbjai3o13S3W0nhv8AhdTW22yNzXtlW30m1lL+X0JWouhhy6Q3uxUV2pwWx1ULZA0826jiPIdR5F31pITU4qUeTMpOEqcnGSw0ERFyOIREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBdO+0Iudlrbc524KqnfDvdW80jX6V3EXGUVKLi+TOUJOElJc0Q/vFtrbRcprbcYHQVULt17HDn4R1g8wV6+XWH6vEWKaOlp43GCKVktTKB2sbGkE6nrOmgHhUm7rZrTdmtbc7bSVgb7Hs8LX7vi1HBYjiLHOEsD1Qs0NE4StAdJBQwMa2PUcN7iBqRx05rET2co2lRVa9VKmn6vwfQKe1Ne9pOjb0W6rXTkvP/v1M8CLzMMX624jtMdztcxkgeS0hw0cxw5tcOghc18ulFZbVPc7jMIaaBu892mvgAA6STwAW1Vam6ftE1u4znpgwToVFU9k4vezjHXPYjtnHh2ssuMK2skicaKvmdPBNp2uruLmE9BB14dWixG30dVcK2KioYH1FTK7djjjGpcf7eFSDsWZeFcT3JtknpJ4vRDtyIVkTHRynoadCdCegFZnbbRaraXOt1to6Qu9kYIGsJ8egWM/t+hfVnWt6y3G+PDivH59zd/3LcadQjQuaLU0uHHg/P84+x1cF2h1iwrbrS94e+mga17hyLubtPBqSvYRFtKdONOChHklgwdWpKrN1Jc28v1CIi5nWEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAcNdUxUdFPVzu3YoI3SSHqa0ak+YKM+LswcRX+4STMuFTQ0e9+hpqeUsDW9G8RoXO6yfIpJX2hFzstbbi7cFVTvh3ureaRr9KiVdrdW2m4zW64QOgqoHbr2OH0jrB5grH7V17imoRg2ovOcd/JuNjbe2qSqSmk5rGM9F3X5+pnuV+Yl4t18pbddq6att1TI2Imd5e+EuOgcHHjprpqD0KQiipl9YavEWKaOjpo3GOOVktRIBwijaQSSes6aDrJW8M1seOwfDTU1HSx1NfVBz2iUkMjYDpqdOJ1PADxq6BfzpWU6tzJ7kXwb4+n6E2k02Fa/p0rSK35J5S4er+5na0FmxgTEbsYVlzt1vqLjS1rxK10A3nMdoAWuHMcuB5aLN8qcxpcVV01rudJDT1rIzLG+EnckaCARodSCNR08fItjHTpXrV6NtrdqnGTxnn1TPGt693oF21KK3sYafJp8eGDBclsM3DDWGZW3RvYqmrn7MYd4HsQ3QADpw14anyL0c0sP1WJcH1NuoXtFUHslia46B5add0no1Gvl0Xl4kzWwtZ6l9LDJPcpmHRwpWgsaerfJAPk1XWsmcGF66obBWMq7aXHQPnYDH5XNJ08o0XVG402nQ9x9qsYxz/flk7ZW2q1Lj+oKk853uX7c8GucD5d4onxRRurbZPb6amqGSzTTaN4NcDo3jxJ004cFIxfmGSOWJksL2SRvaHNc06hwPIgjmFg2bWOpcIU1LBQ08U9dV7xaZddyNjdAXEDmdToBr1rstrW10W3lPeeObb+3I6ru8u9euoU91b3JJfVt5M7Whc58c3SfEFTYLZVy0lFSHscxicWumk07bUjjujXTTx6rLMp8yKzEtzks93p4GVPYjJDLAC1rwObS0k6Hjrr41r7OrDdbaMXVdzMT3UFwk7NHNp2rXn2TCeg66kdYK8zWtQlc6eqtq3ut4fdfM9bQNNjaam6N4lvJZj1T8r0z9zG8P4nvtirmVduuVQxwOro3yF0cg6nNJ0I+lSgwrd4r9h2hu8LCxtVEHlp47ruTh5CCFE630lTcK2KjoYH1NTK7dZFGNXOP/wC6VKrA1nfYMJW60SPD5KeECQjlvklztPBqSvy7J1K8pzi29zH38emcn7NtKVvGFOSSVTPrjz64we0iItufPwiIgCLFM2sa0+XuA6/FlVQTV8VGYg6CJ7WOdvyNZwJ4cN7XyLQ3rx7F3j3f55CgJSIot+vHsXePd/nkKevHsXePd/nkKAlIii368ew9493+eQrkj2xsOEjsmCr20e9qYT+IQEoEUb6PbAwI9wFVhzEsA62sgf8A0kCyWx7UOUlylEc91uFrJ6a2gka0eNzN4BAbrReThjE2HsT0IrcPXu33Wn6X0lQ2QN8B0PA+Ar1kAREQBEPAKL022JYo5nxnBF3O44t19GQ8dDogJQoot+vHsXePd/nkKevHsXePd/nkKAlIii4Nsewa8cEXgeKrhXYh2xMJn9bhC/s+DJA7/wAgmQSbRR3pNrvLmThU2bE8Hh9DRPH0SL3rTtQZQ1zg2a819v16aq3SgDytDggN1IsUwrmRgPFJaywYus1fK7gIY6polP8AIdHfQsrQBERAEREARRsxLtZ2OyYjudmkwbdpn0FZLSukbVRAPMbywkA9B01Xn+vHsHeRePncKZBKNFFz149g7yLx87hT149g7yLx87hTIJRoouevHsHeRePncKevHsHeRePncKZBKNefeLHZ7w1oulspKzd9iZog4t8RPEKNnrx7B3kXj53Cnrx7B3kXj53CuE4Rmt2SyjnCcqct6Dw/BJi12232un9D26ip6SLnuQxhgJ6+CxHNXAX+cIaaelqmUtfTAtY6QEsew8S06cRx4g+NaV9ePYO8i8fO4Vy0u2DYJ6qGAYJvDTLI2ME1cPDecBr9K6a9pRuKLozXwvod9te17auq9OXxLrzNs5V5cvwpWzXO41kVTWvjMUbYQdyNpIJOp4knQdA0XVz/AMS1FrstPZqKV0U1w3jM9p0IiboCB8IkDxArZ60jtJ0UwuVouOhMLoZICegODg4ecE+ZePqlFWGlzhbLC/l8T3dIry1LV4VLp5f24LgaiREXzY+qG4tnjEtQamowxVSl8IjM9JvH2GhG+weDiDp4+tZvmfgaHGNHTujqhSV1KXdikc3ea5rtNWuHPoB16FqnZ/opqjHoqmA9ipKWR0jujttGgfSfMpAXGuo7dSPq6+qhpadnspJXhrR5SvoeiRjd6X7O54xy1x7Lz4f6HzHaCcrLV/aWvCeE+Hd8OXlfqYJlfluMKV0t0r62OrrXRmKMRsLWRtOmp48SToOrRbAnhinidDPEyWNw0cx7QQR4QV1LNeLVeYHT2q4U1ZG06OdDIHbp6j1LvL3LO2oUKKhQXw/XJn766ubmu6lw/j+mPTodSgtdsoHOdQW6kpC72RhhazXx6BdtEX6YxUViKwfklKUnmTywiIuRxCIiA0/tj9z1iL4dL95jVexVhO2P3PWIvh0v3mNV7FRgIiKAIiIAiIgO9YbxdrBdI7pZLlV22ujOrKillMbx5RzHgOoUwNnLaTGIqylwnj90FPdJnCOjubQGRVTjyZI3kyQ9BHauPDQHTWGKKgtpRaP2QMz58eYEfaLzUma+2Pchmkee2qICP0Up63cC1x626/tLeCoPjuSqcrfbk/xr/rFWxu5Kpyt9uT/Gv+sVGDiREUAREQBERAfDxIJGpHI9IWycuc78x8DSRMt1/mr6BmmtBciaiEjqBJ3mfyuHiWt0QFgOSe0NhLMKWG0VzfSHED9GtpKiQGOod/6MnAOPvTo7q15rdCqWBIIIJBB1BB4g9alzsrbQc9XVUmBce1plmkIitl0md20juTYZiebjya/p5HjoTcglghRCqCrnNH3TcVfLVZ9u9Y4sjzR903FXy1WfbvWOLiAiIgCIiAIiIAuzaf8AVqL+Ji+u1dZdm0/6tRfxMX12oC2ALycW2ChxLY5rVcGnscmhY9vso3jk5vhH9wvWCw/GuYlgwtXNoKv0TU1ZaHOip2AmMHkXEkAa9XNdF3UoU6T94aUXweT9dlSuKlZK2Tc1xWPHU0ziTLHFloqXthoH3On17SakG9qPCz2QPn8a61ky6xhdKhsTbNPRsJ7aWrHYmtHXoeJ8gUicK4gtmJbU25WuYyRFxY5rm7r43Dm1w6DyXbu9xo7TbZ7lXzNhpqdm/I89A/E9Gizi2ZsZ/wCaM3uc+axj59jUvazUYf4JU1v8uTzn5dzxsvsJUWEbN6Dp39mqJSH1M5Ghkd4uho6B/dYHtJU9xfR2moY17rfE6QS7o7Vkh03S7ybwB8fWsiw7mvhu83mO2NjrKR8z9yCSdjQx7jyHAndJ6NVnkjGSxlkjGvY4aFrhqCPEvSdC1v7F29tNKPLh0xx/O55Mbi703UI3V3BuXPj1ysfnYj/s9QXF+M5aqmD/AEEyme2qePYEnTcbryJ14+IFZrmvmVJhyt9JrNFFLXhodNLKNWQ6jUADpdpx6hw5rZNPTwU0XYqeGOGMcmsaGjzBRmzhoamizDuhqGu0qJBPE48nMcBpp4iCPIvJvYVtG01U6Msty4vtnt25HtafUoa7qrq1oYSjwXfD69+Z7VizhxNS1rXXVtNcKUnt2CIRvA96Rw18YW+bTX0t0tlPcaKTslPURiSN3WCP6qH3LieAUocpaGqt2XtppqxrmTdidIWO5tD3FwHmIXHZnULmvVnSqycklnL6PPfz+xy2t0y0tqUKtGKjJvGFwysdvH7mVIiLZGFCIiA0/tj9z1iL4dL95jVexVhO2P3PWIvh0v3mNV7FRgIEQc1ASbyW2acP49yys2LK3Et3o6i4Mkc+GCOIsZuyvZwLhrybr5Vk9fsb2d0Z9L8dXKJ+nD0RQxyN1/lLStobIvc74U+KqPvEq2uqCvHN3Z/xzl3QS3eZtNebLFxlraLe1hHXJGeLR74agdJC1IrZKuCGqpZaapiZNDKwskje0Oa9pGhBB5gjgqxM3MNxYPzNxFhqAOFPQVz2U4PPsR0fGPI1zR5EBiyIigNt7IuJZMOZ6WWPshbTXbfts7QeDuyDVnmkazzlWHDkqs8uql9HmFhqrjJD4bvSPbp4JmK0wclUD47kqnK325P8a/6xVsbuSqcrfbk/xr/rFGDiREUBk+V+CrlmFjOlwraaqkpqupjlkZJVFwjAY0uOu6CeQ6luOTZCzEa3Vl/wu89XZZx/8axnYw7oOy/wtZ9iVYKqCAV42XM26BrnU9vtNzDeOlLcGhx8QkDVrDFuDsV4SmEWJsO3K0lx0a6pgLWO+C/2J8hVpi69woaK40UtFX0kFXSyt3ZIZ4w9jx1Fp4EJgFTyKVO0xs40tpttVjHL2lfHTU7TLX2lurgxg4ukh6QBzLOrUt5aKKvPiOIQH1ERQE+tkTNOTH2CX2e81PZcQWUNjne89tUwHhHN4TwLXeEa/tLd5Vamz9jR+A82LLe3SllFJMKSvGvA08pDXE/BO6/+VWVg6jVVAr9zAyPzXuOPMQ3CiwVXTUtVdKqaGQTQgPY6VzmuGr9eIIK8T1A84e8Wv/34P+RWO6DqCaDqCYBXF6gecPeLX/78H/Itf3y1XCx3irs91pnUtfRymGohcQTG8cwSCR5irXCBoeAVaO0J7uWNPleb8EBgqIigOe3UdTcbhTW+ihdNVVUzIYI2kave5wa1o14cSQFsX1A84e8Wv/34P+RYrlh7peFvlqj+3YrRgB1BUFcfqB5w94tf/vwf8i57bkNm9FcqWWTA1e1jJ43OPZ4OADwSf1nUrFtB1BfCAOgJgH3oWhs4MDYhmxfU3e3UE9wpa0tfrAN50bg0NLSOenDUHlxXfxvnDWR3Kaiw1BTeh4nFhqpml5kI5lrdQA3wnXXwLtZe5t1FfdoLXiOCnZ6IeI4qqEFoDzyD2kngTw1Hm6VltQv9N1Fq1nNrjwa5Z5fnTybHTNO1XS4u8pwT4cYvnjny/H4MgyRwvcsOWCqfdWdhqK2YSCAkExtDdBrp0njw8S9zMqw1GI8HVtro3tbUu3ZIg46Nc5rg4NJ8OmiyRF7tOwpU7X3Vf8cY88eZnauo1ql5748b2U/HDkRuwnlxiqqxHTR1lrqKCnhma+aeXQANa4E7vHtidOGikiFrXNXMl2Gqz0ntEEU1x3A6aSXUshB5DQc3EceoDTnqsIsWceI6ata66xUtfSk9uxkXY3ge9IOmvgIWftbvTdHqSt1Jtt8X28enjJpryy1XXKcblwSSXBZw3549/LRIFeNirDFlxNSNp7vRtm3NTHICWvjJ/dcOI8XJd+019LdLbT3GikElPURiSN3WD+K7S1MoU68MSScX6pmPhOrb1N6LcZL0aMHsWVmErTXMrG009ZJGd6MVUu+1p690AA+XVZwiLhb2tG3ju0oqK8HO5u691LerTcn5CIi7z84REQGn9sfuesRfDpfvMar2KsJ2x+56xF8Ol+8xqvYqMBBzRBzUBYlsi9zvhT4qo+8Sra61NsjPYNnjCgL2g9in6f8A3Eq2ZcbvardEZbhc6KkjHEvnnZGB5SQuQO6eSrj2qKyCt2gMWy07g5jKmOEkfvMhja7zEEeRSizk2lsG4YtVTRYSr6fEN+c0si9DnfpoHfvySDg7TnutJJ5cOagtX1dTX11RXVs76iqqZXTTSvOrpHuJc5x8JJJUYOFERQGVZP2991zXwnb2DXs15pdeH7LZGucfM0qz8clBnYZwdLesz5sVTRH0DYYHbjyODqmVpa0eRhe7wat61OZVA+O5Kpyt9uT/ABr/AKxVsbuSqcrfbk/xr/rFGDiREUBuTYw7oOy/wtZ9iVYKq+tjDug7L/C1n2JVgqqAREVB8cA5pBAIPWq4dpfBMWA83rra6KHsVtq92voWgaBkUmurB4GvD2jwAKx9RD/xC7XGyvwfemj9JJHVUjz4GmN7f6uUYIpIiKA+EBwLTyI0VmmRF/fijJ7C17lcXTT26NszidSZGDsbz/3MKrMU9th2tfVZEU0LjqKO5VUDfAC8P/8ANVA3miIqAeRVaG0J7uWNPleb8FZeeRVaG0J7uWNPleb8FGDBURFAZFlh7peFvlqj+3YrRwquMsPdLwt8tUf27FaOFUAutdYZai2VUELt2WSF7GHqcWkD6V2USS3lhljLdaaIbSwy08r4JmOjlicWPa4aFrhwIPlXPaqWorrnS0dI1z6ieZjIw3nvE8P7+RSQxflvhvElY6uqI56Ssf7OameGmTwuBBBPh01XNg3L/D2F6g1dFDLPWaFoqKhwc5oPMN0ADfINVgY7K3Pt91yW5364+Xc+ky2xtfd95Re/jl0z8+33MrYCGgE6nTn1r6eSIt+fNSMecVFU0eYl0NS12lQ9s8TjycwtAGniII8ixBSxxZhey4npG093pBKY9TFK1xbJGTz3XD+nJY9Y8qMJWuuZWGGprXxu3mNqpQ5jSOR3QAD5dVhb3Zi4qXMp05Ldk88emT6HYbW2tK0jCrF70Ulw5PB38oqKqoMu7TT1bXMlMbpNx3NrXvLmjzELLERbS3oqhSjSX/VJfQwdzXdxWnVa4ybf1eQiIu46AiIgCIiA0/tj9z1iL4dL95jVexVhO2P3PWIvh0v3mNV7FRgIiKA/TZJGjRskgHUHEL8P0edXjfPvuP8AVfpzHN3d5rm7zQ5uo01HWPAviAIi5KWH0RVRQdlhh7LI1nZJn7rGanTVx6GjXUnoCA41kWXeCsQ49xNBYMOUTqipk0MsjgRFTx68ZJHfstHnPIalSIy+2Q6qd8NZjXE8DKcgONLaRvueDx07M8aDyNPjUn8B4LwzgeyttGF7TBb6bUF+4NXyu/ee89s93hJVwDo5R4DtWXOCKPDVq1k7HrJU1Dm6PqZnab8jurXQADoAA6FlyIqD47kqnK325P8AGv8ArFWxu5Kpyt9uT/Gv+sVGDiREUBuTYw7oOy/wtZ9iVYKq+tjDug7L/C1n2JVgqqAREVAUWP8AELc3/L2D2n2Rrqgjxdib/cKU6hr/AIgt6ZPivC+H2PBNHRzVcgB5GV7Wt18kTkYIwIiLiAp0bBYIyVrCeRvlQR/txKC6n/sV251DkFa5njT0dVVVSPEZS0fQxVA3UiIqAeRVaG0J7uWNPleb8FZeeRVaG0J7uWNPleb8FGDBURFAZFlh7peFvlqj+3YrRwquMsPdLwt8tUf27FaOFUAiIqAiIgCIiAIiIAiIgCIiAIiIAiIgNP7Y/c9Yi+HS/eY1XsVYTtj9z1iL4dL95jVexUYCDmiDmoCQWJMtPT/ZNwhjy1U+9c7LTVDa1rG9tNR+iZST4TGTvfBLuoKPqsP2TYop9nDC8E0bJIpIKhr2PGrXA1EoII6QQob7RWXMmWuZFVa4I3+k9XrVWuQ8R2EnjHr1sPa+LdPSqDXCIigJpbFOa/p5ZRl7faneudti3rbJI7jUUzf+nx5uj+lun7pUl1VLhy83LD1+ob5Z6l1LcKGZs9PKP2XDrHSDxBHSCQrJ8msf23MjAdFiOg3YpnDsVbTA6mmnaBvsPg5EHpaQVUDM0RFQfHclU5W+3J/jX/WKtjdyVTlb7cn+Nf8AWKjBxIiKA3JsYd0HZf4Ws+xKsFVfWxh3Qdl/haz7EqwVVAIvjnNa0ucdABqSeAC19j7OjLfBUT/TbE1JPVtHCioXCoqHHq3WHtf5iAqDNr1c6CzWmqut0qo6SipInTTzSHRsbGjUkqs/ODGU2P8AMa8Ypla+OKrm3aWJ3OKBg3Y2nw7o1PhJWZ5/Z737M9/pXTQutGG43hzaIP3pKhw5OmcOB05hg4A8eJAI0+oAiIoD6xsj3tZEwvkcQ1jRzc48APKVaLlhh5uFMvLBhwNAdb7fDBJp0vDRvnyu3ioM7JGBX4zzcoqqohL7XYy24VbiO1c9p/Qx+MvGunUwqwkKoBERUA8iq0NoT3csafK834Ky88iq0NoT3csafK834KMGCoiKAyLLD3S8LfLVH9uxWjhVcZYe6Xhb5ao/t2K0cKoBERUBERAEREAREQBERAEREAREQBERAaf2x+56xF8Ol+8xqvYqwnbH7nrEXw6X7zGq9iowEHNEHNQFiWyL3O+FPiqj7xKuXaZy2bmRlxUUlJE03u3a1VseeZkA7aLXqe3tfHunoXFsi9zvhT4qo+8Sra65AqXe17HuY9jmPaS1zXDQtI4EEdBC+KQm2rln/lfGbcZ2qn3bTfZD6IDR2sNZpq7xCQAuHvg/wKPagC2ps0ZpS5Z47ZLWSvOH7kWwXOPiQwa9pOB1sJOvW0uHUtVooC2anmiqII54JGSxSND2PY7Vrmkagg9IIX7UWtiPNf0woBlrfanWrpIy+zyvPGWAcXQ69JZzb73UfsqUq5A+O5Kpyt9uT/Gv+sVbG7kqnK325P8AGv8ArFRg4kRFAd2xXi7WK5R3OyXKrttdGHNZUUspjkaHDQgOHHiOCyN+aeZb27rswMUEfKco/FYeiA9S7YkxFdwRdcQXevB5iprpZAfI5xC8oANGjQAOoDRfUQBERAF2rPba+8XWltVrpJayuq5Ww08EQ1dI88gP79A1J4BdjDFgvWJ73T2WwW2ouNwqDpHBC3U6dLieTWjpcdAFO3ZtyLt+WlGL1eDDcMU1Ee7JM0ax0jDzji16T+0/meQ0HOgybZ+y1pcscAU9n1jmulQfRFzqWjhJMR7EH9xo7UeInmStiIioCIiAHkVWhtCe7ljT5Xm/BWXnkVWhtCe7ljT5Xm/BRgwVERQGRZYe6Xhb5ao/t2K0cKrjLD3S8LfLVH9uxWjhVAIiKgIiIAiIgCIiAIiIAiIgCIiAIiIDUG2P3PWIvh0v3mNV7EHqKtUxVh6y4psc9jxBb4bhbqgtMtPLruv3XBzddCORAPkWDeoFk/3hWnzP/MoCuPQ9RX0A68irG/UCyf7wrT5n/mX31Asn+8K0+Z/5kwDqbIvc74U+KqPvEq2uvNwxYbRhmxU1jsNBFQW6lDhBTxa7rAXFx01J6ST5V6SoMczLwhbcdYIueF7q3SCtiLWyAauhkHFkjfC1wB+jpVZmKrDc8M4kuGH7vAYa+3zugnaOWo5OHW0jRwPSCFassKxflTl5i68uvOI8J2643B0bY3VErXB7mt13QdCNdNVAVl6HqKaHqKsc9QLJ/vCtPmf+ZPUCyf7wrT5n/mTAK77NcbhZrtSXa11ElLXUczZ6eZnON7TqD/8AXSNQrIsjMxaHMvANLfoAyGuZ+guNKD+onAG8B708HNPUR0grzfUCyf7wrT5n/mWR4Hy7wZgieqnwpYKa0vq2tZP2Bz9JA0kt1BJHDU8fCUBlLuSqdrQfRk/A/rX/AFirY1rR+QmUD3ue7AdqLnEknR/En+ZAVw6HqKaHqKsc9QLJ/vCtPmf+ZPUCyf7wrT5n/mTAK49D1FND1FWOeoFk/wB4Vp8z/wAy/ceQ+ULDq3ANmPwo3H+rkwCuA8OfBfkPYXboe0nqBGqsyo8n8raR29BgDDYPvrfG7+oKyG2YWwza3B1tw7aKIjkaeijj0/7WhMArTwvgDG+J5GtsGE7zXhx/WR0jmxjxvdo0edbyy62SMS3CSOqxxd6ezUuurqSicJ6hw6i/2DPGN9TS0CJgGK5c5e4Sy/tXpfhe0RUYeB2ac9vPOR0vkPF3i5DoAWVIioCIiAIiIAeRVaO0ID6uWNOB/wBXm/BWXLX98yXyuvd4q7xdcGW2rr6yUzVE79/ekeeZOjlAVraHqKaHqKsc9QLJ/vCtPmf+ZPUCyf7wrT5n/mTAIC5YA+qXhbgf9ao/t2K0cLXVuyOyot9wpq+iwRa4aqmlZNDI3f1Y9pDmuHbcwQCtioAiIqAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiA/9k=";

const TEMPLATE_BODY = `Dear {{CUSTOMER_NAME}},

Re: Policy Renewal — {{POLICY_NUMBER}}

Your policy is due for renewal on {{RENEWAL_DATE}}. Your renewal premium is {{PREMIUM_AMOUNT}}.

To accept your renewal, please contact us on 0121 000 0000 or visit your online account. If you have any questions, our team is happy to help.

Yours sincerely,`;

const CLAIM_PARTIES = {
  "CLM-2024-0841": [
    { id:"p1", role:"Policyholder",       name:"James Thornton",   contact:"j.thornton@email.com",   phone:"07700 900123", address:"14 Oak Avenue, Birmingham, B12 9QP" },
    { id:"p2", role:"Third Party",        name:"Maria Vasquez",    contact:"m.vasquez@email.com",    phone:"07700 900456", address:"8 Elm Street, Coventry, CV1 2AB"    },
    { id:"p3", role:"Third Party Insurer",name:"Admiral Insurance",contact:"claims@admiral.com",     phone:"0800 600 0001", address:"PO Box 1234, Cardiff, CF99 1FJ"    },
    { id:"p4", role:"Repairer",           name:"AutoFix Bodyshop", contact:"jobs@autofix.co.uk",     phone:"0121 555 0199", address:"Unit 5, Tyburn Road, Birmingham, B24 8NP" },
    { id:"p5", role:"Loss Assessor",      name:"David Hicks (CAS)",contact:"d.hicks@cas-assess.com",phone:"07711 223344",  address:"22 Park Lane, Solihull, B91 3GG"   },
  ],
  "CLM-2024-0756": [
    { id:"p1", role:"Policyholder",       name:"Rachel Green",     contact:"r.green@rdtltd.com",     phone:"07700 900321", address:"55 Birchwood Drive, Manchester, M14 5QR" },
    { id:"p2", role:"Emergency Repairer", name:"PlumbSafe Ltd",    contact:"ops@plumbsafe.co.uk",    phone:"0161 555 0177", address:"12 Canal St, Manchester, M1 3WB"   },
    { id:"p3", role:"Loss Adjuster",      name:"Claire Osei (AXA)",contact:"c.osei@axa.co.uk",      phone:"07722 334455",  address:"AXA House, 5 Old Broad St, London, EC2M 1RX" },
  ],
  "CLM-2023-1204": [
    { id:"p1", role:"Policyholder",       name:"Tom Bradley",      contact:"t.bradley@rdtltd.com",   phone:"07700 900654", address:"9 Maple Close, Leeds, LS8 2PQ"     },
    { id:"p2", role:"Police Liaison",     name:"DC Sarah Nguyen",  contact:"s.nguyen@westyorks.pnn.police.uk", phone:"101", address:"Elland Road Police Station, Leeds, LS11 8BU" },
    { id:"p3", role:"Salvage Agent",      name:"BidCars UK",       contact:"salvage@bidcars.co.uk",  phone:"0800 123 4567", address:"Auction Park, Sheffield, S9 1EG"  },
  ],
};

const SEARCH_DATA = {
  policy: [
    { id:"POL-00421", type:"policy", name:"James Thornton", status:"Active",  ref:"POL-00421", detail:"Renews 31 Mar 2026 · NCD: 5 yrs · Premium: £842" },
    { id:"POL-00389", type:"policy", name:"Sarah Mitchell",  status:"Active",  ref:"POL-00389", detail:"Renews 14 Apr 2026 · NCD: 3 yrs · Premium: £394" },
    { id:"POL-00267", type:"policy", name:"David Okafor",    status:"Lapsed",  ref:"POL-00267", detail:"Expired 01 Jan 2026 · NCD: 2 yrs · Premium: £612" },
  ],
  customer: [
    { id:"CUS-1042", type:"customer", name:"James Thornton", status:"Active", ref:"CUS-1042", detail:"j.thornton@email.com · B12 9QP · 2 policies" },
    { id:"CUS-0871", type:"customer", name:"Sarah Mitchell",  status:"Active", ref:"CUS-0871", detail:"s.mitchell@email.com · M4 2DT · 1 policy"  },
    { id:"CUS-0654", type:"customer", name:"Jamila Hassan",   status:"Active", ref:"CUS-0654", detail:"j.hassan@email.com · LS1 4HB · 3 policies"  },
  ],
  claim: [
    { id:"CLM-2024-0841", type:"claim", name:"James Thornton", status:"Open",   ref:"CLM-2024-0841", detail:"Motor – Rear-end collision · Opened 12 Feb 2026 · £3,200 est." },
    { id:"CLM-2024-0756", type:"claim", name:"Rachel Green",   status:"Open",   ref:"CLM-2024-0756", detail:"Home – Escape of water · Opened 28 Jan 2026 · £1,800 est."    },
    { id:"CLM-2023-1204", type:"claim", name:"Tom Bradley",    status:"Closed", ref:"CLM-2023-1204", detail:"Motor – Theft · Settled 05 Nov 2023 · £8,400 paid"             },
  ],
};

const ICONS = {
  dashboard:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  templates:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>,
  distribute:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  bulk:          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  esign:         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  workflow:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/></svg>,
  integrations:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="6" height="10" rx="1"/><rect x="16" y="7" width="6" height="10" rx="1"/><path d="M8 12h8"/><path d="M8 9h2"/><path d="M8 15h2"/><path d="M14 9h2"/><path d="M14 15h2"/></svg>,
  useradmin:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  storage:       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
  analytics:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  security:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  compose:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
};

const WA_LOGO = "data:image/png;base64,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";

const NAV_ITEMS = [
  { id:"dashboard",    label:"Dashboard",        sec:null,        badge:null },
  { id:"templates",    label:"Templates",        sec:"DOCUMENTS", badge:"284" },
  { id:"distribute",   label:"Distribute",       sec:"DOCUMENTS", badge:null },
  { id:"bulk",         label:"Bulk Generation",  sec:"DOCUMENTS", badge:null },
  { id:"esign",        label:"eSignature",       sec:"DOCUMENTS", badge:"12" },
  { id:"workflow",     label:"Workflow & Rules",  sec:"AUTOMATION",badge:null },
  { id:"integrations", label:"Integrations",     sec:"AUTOMATION",badge:null },
  { id:"useradmin",    label:"User Admin",       sec:"MANAGE",    badge:"8" },
  { id:"storage",      label:"Storage & Archive", sec:"MANAGE",   badge:null },
  { id:"analytics",    label:"Analytics",        sec:"MANAGE",    badge:null },
  { id:"security",     label:"Security",         sec:"MANAGE",    badge:null },
];

function Cd({ children, style, onClick }: { children?: any, style?: any, onClick?: any }) {
  return <div onClick={onClick} style={{ background:CB, borderRadius:10, border:`1px solid ${BD}`, boxShadow:"0 1px 4px rgba(0,0,0,0.06)", ...style }}>{children}</div>;
}
function Icon({ v, size=18 }: { v: any, size?: number }) {
  if (v === "__WA__") return <img src={WA_LOGO} alt="WhatsApp" style={{ width:size, height:size, objectFit:"contain", verticalAlign:"middle", display:"inline-block" }} />;
  return <span style={{ fontSize:size }}>{v}</span>;
}
function PH({ title, sub, nomb }: { title?: any, sub?: any, nomb?: any }) {
  return <div style={{ marginBottom:nomb?0:20 }}><h1 style={{ fontSize:20, fontWeight:700, color:TP, margin:0, marginBottom:4, fontFamily:F }}>{title}</h1><p style={{ fontSize:13, color:TS, margin:0 }}>{sub}</p></div>;
}
function Bdg({ label, color, light }: { label?: any, color?: any, light?: any }) {
  return <span style={{ display:"inline-block", fontSize:11, padding:"3px 9px", borderRadius:20, background:light||`${color}15`, color, fontWeight:600, whiteSpace:"nowrap" }}>{label}</span>;
}
function SL({ children }: { children?: any }) {
  return <div style={{ fontSize:11, fontWeight:600, color:TM, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:12 }}>{children}</div>;
}

export default function DocProFixed() {
const getEmailFromCookie = () => {
  try {
    const match = document.cookie.match(/sb-access-token=([^;]+)/);
    if (match) {
      const base64 = match[1].split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '=='.slice(0, (4 - base64.length % 4) % 4);
      return JSON.parse(atob(padded)).email || "";
    }
  } catch(e) {}
  return "";
};
const [userEmail, setUserEmail] = useState(() => typeof window !== 'undefined' ? getEmailFromCookie() : "");
  const [nav, setNav] = useState("dashboard");
useEffect(() => {
  try {
    const allCookies = document.cookie;
    const match = allCookies.match(/sb-access-token=([^;]+)/);
    if (match) {
      const token = match[1];
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '=='.slice(0, (4 - base64.length % 4) % 4);
      const payload = JSON.parse(atob(padded));
      if (payload.email) setUserEmail(payload.email);
    }
  } catch(e) {
    console.error("Email parse error:", e);
  }
}, []);
useEffect(() => {
  setTemplatesLoading(true);
  fetch("/api/templates")
    .then(r => r.json())
    .then(data => { setDbTemplates(data); setTemplatesLoading(false); })
    .catch(() => setTemplatesLoading(false));
}, []);
  const [sideOpen, setSideOpen] = useState(true);
  const [toast, setToast] = useState(null);
  const [selTpl, setSelTpl] = useState(null);
  const [tSearch, setTSearch] = useState("");
const [dbTemplates, setDbTemplates] = useState<any[]>([]);
const [templatesLoading, setTemplatesLoading] = useState(false);
  const [tCat, setTCat] = useState("All");
  const [cSearch, setCSearch] = useState("");
  const [cCat, setCCat] = useState("All");
  const [channels, setChannels] = useState([]);
  const [composeStep, setComposeStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("policy");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedParty, setSelectedParty] = useState(null);
  const [claimPartyStep, setClaimPartyStep] = useState(false);
  const [composeMode, setComposeMode] = useState("template"); // "template" | "adhoc"
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiTone, setAiTone] = useState("professional");
  const [aiPurpose, setAiPurpose] = useState("");
  const [aiRecipient, setAiRecipient] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiDraft, setAiDraft] = useState("");
  const [transLang, setTransLang] = useState("");
  const [transGenerating, setTransGenerating] = useState(false);
  const [transOpen, setTransOpen] = useState(false);
  const [distChannels, setDistChannels] = useState([]);
  const [distSchedule, setDistSchedule] = useState("immediate");
  const [emailConfig, setEmailConfig] = useState({ source:"pas", manualList:"", subject:"Your Policy Renewal – Action Required", fromName:"RDT Limited", fromEmail:"noreply@rdtltd.com", replyTo:"renewals@rdtltd.com", format:"attachment", testEmail:"" });
  const [emailTab, setEmailTab] = useState("recipients");
  const [bulkPct, setBulkPct] = useState(0);
  const [bulkRun, setBulkRun] = useState(false);
  // user admin
  const [users, setUsers] = useState(INIT_USERS);
  const [showCreate, setShowCreate] = useState(false);
  const [selUser, setSelUser] = useState(null);
  const [uTab, setUTab] = useState("users");
  const [uSearch, setUSearch] = useState("");
  const [newU, setNewU] = useState({ name:"", email:"", role:"doc_viewer", dept:"", mfa:false });

  const notify = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const secs = ["DOCUMENTS","AUTOMATION","MANAGE"];
  const navBySec = sec => NAV_ITEMS.filter(i=>i.sec===sec);
  const topItems = NAV_ITEMS.filter(i=>i.sec===null);

  const permColor = v => ({ full:{bg:GL,color:"#16a34a",lbl:"Full"}, edit:{bg:ACL,color:AC,lbl:"Edit"}, view:{bg:AL,color:"#d97706",lbl:"View"}, none:{bg:"#f3f4f6",color:TM,lbl:"None"} }[v]||{bg:"#f3f4f6",color:TM,lbl:"—"});

  return (
    <div style={{ minHeight:"100vh", background:PG, fontFamily:F, color:TP, display:"flex", overflow:"hidden" }}>

      {toast && (
        <div style={{ position:"fixed", top:16, right:16, zIndex:9999, background:toast.type==="success"?GR:RD, color:"#fff", padding:"11px 18px", borderRadius:8, fontSize:13, fontWeight:600, boxShadow:"0 4px 16px rgba(0,0,0,0.15)" }}>
          {toast.type==="success"?"✓ ":"✗ "}{toast.msg}
        </div>
      )}

      {/* Sidebar */}
      <aside style={{ width:sideOpen?224:56, minHeight:"100vh", background:"#fff", borderRight:`1px solid ${BD}`, display:"flex", flexDirection:"column", transition:"width 0.2s", flexShrink:0, overflow:"hidden" }}>
        <div style={{ height:82, display:"flex", alignItems:"center", justifyContent:sideOpen?"flex-start":"center", padding:sideOpen?"0 16px":"0 8px", borderBottom:`1px solid ${BD}`, flexShrink:0, background:"#fff", gap:8 }}>
          <img src={RDT_LOGO} alt="RDT" style={{ height:sideOpen?70:57, width:sideOpen?210:66, objectFit:"contain", display:"block", flexShrink:0 }} />
        </div>
        <nav style={{ flex:1, padding:"8px 6px", overflowY:"auto" }}>
          {/* ── Compose CTA ── */}
          <div style={{ padding:"8px 2px 10px", borderBottom:`1px solid ${BD}`, marginBottom:8 }}>
            <button
              onClick={()=>setNav("compose")}
              style={{
                width:"100%",
                display:"flex",
                alignItems:"center",
                justifyContent:sideOpen?"flex-start":"center",
                gap:8,
                padding:sideOpen?"11px 14px":"11px 0",
                borderRadius:9,
                border:"none",
                cursor:"pointer",
                fontFamily:F,
                fontWeight:700,
                fontSize:13,
                background: nav==="compose"
                  ? "linear-gradient(135deg,#3a5be0 0%,#6a3fd1 100%)"
                  : "linear-gradient(135deg,#4f6ef7 0%,#7c5cf6 100%)",
                color:"#fff",
                boxShadow: nav==="compose"
                  ? "0 4px 14px rgba(79,110,247,0.55)"
                  : "0 2px 8px rgba(79,110,247,0.35)",
                transition:"all 0.15s",
              }}>
              <span style={{ display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{ICONS.compose}</span>
              {sideOpen && <span style={{ flex:1, textAlign:"left" }}>Compose Letter</span>}
              {sideOpen && <span style={{ fontSize:16, opacity:0.75 }}>+</span>}
            </button>
          </div>
          {topItems.map(item => {
            const active = nav===item.id;
            return <button key={item.id} onClick={()=>setNav(item.id)} style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"8px 10px", borderRadius:7, border:"none", cursor:"pointer", background:active?`${AC}12`:"transparent", color:active?AC:TS, fontSize:13, fontFamily:F, fontWeight:active?600:400, marginBottom:1, textAlign:"left" }}>
              <span style={{ width:18, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{ICONS[item.id]}</span>
              {sideOpen && <span style={{ flex:1 }}>{item.label}</span>}
              {sideOpen && item.badge && <span style={{ background:active?`${AC}20`:"rgba(0,0,0,0.06)", color:active?AC:TS, fontSize:10, padding:"1px 6px", borderRadius:20, fontWeight:600 }}>{item.badge}</span>}
            </button>;
          })}
          {secs.map(sec => (
            <div key={sec} style={{ marginTop:12 }}>
              {sideOpen && <div style={{ fontSize:10, color:"#b0b7c3", fontWeight:600, letterSpacing:"0.08em", padding:"4px 10px 2px" }}>{sec}</div>}
              {navBySec(sec).map(item => {
                const active = nav===item.id;
                return <button key={item.id} onClick={()=>setNav(item.id)} style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"8px 10px", borderRadius:7, border:"none", cursor:"pointer", background:active?`${AC}12`:"transparent", color:active?AC:TS, fontSize:13, fontFamily:F, fontWeight:active?600:400, marginBottom:1, textAlign:"left" }}>
                  <span style={{ width:18, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{ICONS[item.id]}</span>
                  {sideOpen && <span style={{ flex:1 }}>{item.label}</span>}
                  {sideOpen && item.badge && <span style={{ background:active?`${AC}20`:"rgba(0,0,0,0.06)", color:active?AC:TS, fontSize:10, padding:"1px 6px", borderRadius:20, fontWeight:600 }}>{item.badge}</span>}
                </button>;
              })}
            </div>
          ))}
        </nav>
        <div style={{ padding:"10px 6px", borderTop:`1px solid ${BD}` }}>
          <button onClick={()=>setSideOpen(p=>!p)} style={{ width:"100%", padding:"7px 10px", borderRadius:7, border:`1px solid ${BD}`, background:PG, cursor:"pointer", fontSize:12, color:TS, fontFamily:F, textAlign:"center" }}>
            {sideOpen ? "← Collapse" : "→"}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Topbar */}
        <header style={{ height:60, background:"#fff", borderBottom:`1px solid ${BD}`, display:"flex", alignItems:"center", padding:"0 24px", gap:12, flexShrink:0 }}>
          <div style={{ flex:1, fontSize:13, color:TM }}>DocPro <span style={{ color:BD }}>›</span> <span style={{ color:TP, fontWeight:600 }}>{nav==="compose" ? "Compose Letter" : NAV_ITEMS.find(i=>i.id===nav)?.label}</span></div>
          <span style={{ background:GL, color:"#16a34a", fontSize:11, padding:"3px 10px", borderRadius:20, fontWeight:600 }}>● Live</span>
          <div style={{ width:32, height:32, borderRadius:"50%", background:`${AC}20`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:AC }}>SK</div>
        </header>

        <main style={{ flex:1, overflowY:"auto", padding:24 }}>

          {/* ═══ DASHBOARD ═══ */}
          {nav==="dashboard" && (
            <div>
              <PH title="Operations Dashboard" sub="Real-time overview of document production activity" />
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
                {[
                  { label:"Docs Generated Today", value:"12,847", delta:"+18%", color:AC   },
                  { label:"Templates Active",      value:"284",    delta:"+3",   color:GR   },
                  { label:"Pending Signatures",    value:"1,203",  delta:"-5%",  color:AM   },
                  { label:"Delivery Success",      value:"99.4%",  delta:"+0.2%",color:PU   },
                ].map((m,i) => (
                  <Cd key={i} style={{ padding:20, borderTop:`3px solid ${m.color}` }}>
                    <div style={{ fontSize:12, color:TM, marginBottom:8 }}>{m.label}</div>
                    <div style={{ fontSize:26, fontWeight:700, marginBottom:4 }}>{m.value}</div>
                    <div style={{ fontSize:12, color:GR, fontWeight:500 }}>{m.delta} vs yesterday</div>
                  </Cd>
                ))}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:16 }}>
                <Cd style={{ padding:20 }}>
                  <SL>Document Volume — Last 14 Days</SL>
                  <div style={{ display:"flex", alignItems:"flex-end", gap:4, height:100 }}>
                    {[65,72,58,80,91,76,88,95,102,87,110,98,118,128].map((v,i) => (
                      <div key={i} style={{ flex:1, background:`${AC}${i===13?"ff":"66"}`, borderRadius:"3px 3px 0 0", height:`${(v/128)*100}%`, minWidth:0 }}/>
                    ))}
                  </div>
                </Cd>
                <Cd style={{ padding:20 }}>
                  <SL>Recent Activity</SL>
                  {[
                    { time:"09:41", action:"Template published", user:"Sarah K." },
                    { time:"09:38", action:"Bulk job complete",  user:"System"   },
                    { time:"09:22", action:"Approval requested", user:"James T." },
                    { time:"08:57", action:"eSign completed",    user:"David M." },
                  ].map((a,i) => (
                    <div key={i} style={{ display:"flex", gap:10, padding:"7px 0", borderBottom:i<3?`1px solid ${BD}`:"none", fontSize:12, alignItems:"center" }}>
                      <span style={{ color:TM, width:34, flexShrink:0 }}>{a.time}</span>
                      <span style={{ flex:1, color:TP }}>{a.action}</span>
                      <span style={{ color:TM }}>{a.user}</span>
                    </div>
                  ))}
                </Cd>
              </div>

              {/* Distribution Type Chart */}
              <Cd style={{ padding:20, marginTop:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
                  <div>
                    <SL>Distribution by Channel — March 2026</SL>
                    <div style={{ fontSize:13, color:TS }}>38,412 documents dispatched this month</div>
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    {["This Month","Last Month","YTD"].map((l,i)=>(
                      <button key={l} style={{ padding:"4px 12px", borderRadius:20, fontSize:11, cursor:"pointer", fontFamily:F, fontWeight:i===0?600:400, background:i===0?AC:"#fff", color:i===0?"#fff":TS, border:`1px solid ${i===0?AC:BD}` }}>{l}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 220px", gap:24, alignItems:"center" }}>

                  {/* Horizontal bar chart */}
                  <div>
                    {[
                      { label:"Central Print",    value:16240, pct:42, color:"#4f6ef7", icon:"🖨️" },
                      { label:"Email",             value:11524, pct:30, color:"#22c55e", icon:"✉️" },
                      { label:"Customer Portal",   value:5762,  pct:15, color:"#f59e0b", icon:"🌐" },
                      { label:"SMS",               value:2689,  pct:7,  color:"#8b5cf6", icon:"💬" },
                      { label:"WhatsApp",           value:1541,  pct:4,  color:"#f97316", icon:"__WA__" },
                      { label:"Archive Only",       value:656,   pct:2,  color:"#9ca3af", icon:"🗄️" },
                    ].map((ch,i)=>(
                      <div key={i} style={{ marginBottom:14 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:13 }}>
                            <Icon v={ch.icon} size={14} />
                            <span style={{ color:TP, fontWeight:500 }}>{ch.label}</span>
                          </div>
                          <div style={{ display:"flex", alignItems:"center", gap:10, fontSize:12 }}>
                            <span style={{ color:TM }}>{ch.value.toLocaleString()}</span>
                            <span style={{ fontWeight:700, color:ch.color, minWidth:32, textAlign:"right" }}>{ch.pct}%</span>
                          </div>
                        </div>
                        <div style={{ height:8, background:"#f0f2f5", borderRadius:4, overflow:"hidden" }}>
                          <div style={{ height:"100%", width:`${ch.pct}%`, background:ch.color, borderRadius:4, transition:"width 0.6s ease" }}/>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Donut chart (SVG) */}
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                    <svg width="160" height="160" viewBox="0 0 160 160">
                      {(()=>{
                        const segs = [
                          { pct:42, color:"#4f6ef7" },
                          { pct:30, color:"#22c55e" },
                          { pct:15, color:"#f59e0b" },
                          { pct:7,  color:"#8b5cf6" },
                          { pct:4,  color:"#f97316" },
                          { pct:2,  color:"#9ca3af" },
                        ];
                        const r = 60, cx = 80, cy = 80, stroke = 22;
                        const circ = 2 * Math.PI * r;
                        let offset = 0;
                        return segs.map((s,i)=>{
                          const dash = (s.pct / 100) * circ;
                          const gap  = circ - dash;
                          const rot  = (offset / 100) * 360 - 90;
                          offset += s.pct;
                          return (
                            <circle key={i} cx={cx} cy={cy} r={r}
                              fill="none" stroke={s.color} strokeWidth={stroke}
                              strokeDasharray={`${dash} ${gap}`}
                              strokeDashoffset={0}
                              transform={`rotate(${rot} ${cx} ${cy})`}
                              style={{ transition:"stroke-dasharray 0.6s ease" }}
                            />
                          );
                        });
                      })()}
                      <text x="80" y="75" textAnchor="middle" style={{ fontSize:20, fontWeight:700, fill:"#1a1f2e", fontFamily:F }}>38K</text>
                      <text x="80" y="93" textAnchor="middle" style={{ fontSize:10, fill:"#9ca3af", fontFamily:F }}>dispatched</text>
                    </svg>
                    {/* Legend */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4px 14px", marginTop:8 }}>
                      {[
                        { label:"Print",   color:"#4f6ef7" },
                        { label:"Email",   color:"#22c55e" },
                        { label:"Portal",  color:"#f59e0b" },
                        { label:"SMS",     color:"#8b5cf6" },
                        { label:"WhatsApp",color:"#f97316" },
                        { label:"Archive", color:"#9ca3af" },
                      ].map((l,i)=>(
                        <div key={i} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:TS }}>
                          <span style={{ width:8, height:8, borderRadius:2, background:l.color, flexShrink:0 }}/>
                          {l.label}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </Cd>
            </div>
          )}

          {/* ═══ TEMPLATES ═══ */}
          {nav==="templates" && (()=>{
            const cats = ["All","Renewals","Claims","Certificates","Onboarding","Endorsements","Cancellations"];
            const filtered = (dbTemplates.length ? dbTemplates : TEMPLATES).filter(t=>{
              const matchSearch = !tSearch.trim() ||
                t.name.toLowerCase().includes(tSearch.toLowerCase()) ||
                t.type.toLowerCase().includes(tSearch.toLowerCase()) ||
                t.cat.toLowerCase().includes(tSearch.toLowerCase()) ||
                t.ver.toLowerCase().includes(tSearch.toLowerCase());
              const matchCat = tCat==="All" || t.cat===tCat;
              return matchSearch && matchCat;
            });
            return (
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                  <PH title="Template Library" sub="Create, manage and version control your document templates" nomb />
                  <button onClick={()=>notify("Template editor opened")} style={bP}>+ New Template</button>
                </div>

                {/* Search bar */}
                <Cd style={{ padding:"14px 16px", marginBottom:12 }}>
                  <div style={{ position:"relative", marginBottom:12 }}>
                    <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:15, color:TM, pointerEvents:"none" }}>🔍</span>
                    <input
                      placeholder="Search by name, type, category or version…"
                      value={tSearch}
                      onChange={e=>{setTSearch(e.target.value);setSelTpl(null);}}
                      style={{ ...iS, paddingLeft:38, fontSize:14 }}
                      autoFocus
                    />
                    {tSearch && (
                      <button onClick={()=>{setTSearch("");setSelTpl(null);}} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:16, color:TM, lineHeight:1 }}>✕</button>
                    )}
                  </div>

                  {/* Category pills */}
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                    <span style={{ fontSize:11, color:TM, fontWeight:600, marginRight:2 }}>Filter:</span>
                    {cats.map(c=>(
                      <button key={c} onClick={()=>setTCat(c)} style={{ padding:"4px 12px", borderRadius:20, fontSize:11, cursor:"pointer", fontFamily:F, fontWeight:tCat===c?700:400, background:tCat===c?AC:"#fff", color:tCat===c?"#fff":TS, border:`1px solid ${tCat===c?AC:BD}`, transition:"all 0.15s" }}>{c}</button>
                    ))}
                    <span style={{ marginLeft:"auto", fontSize:12, color:TM, fontWeight:500 }}>
                      {filtered.length} of {TEMPLATES.length} templates
                    </span>
                  </div>
                </Cd>

                {/* No results state */}
                {filtered.length===0 && (
                  <Cd style={{ padding:32, textAlign:"center" }}>
                    <div style={{ fontSize:32, marginBottom:8 }}>🔍</div>
                    <div style={{ fontSize:14, fontWeight:600, color:TP, marginBottom:4 }}>No templates found</div>
                    <div style={{ fontSize:12, color:TM, marginBottom:16 }}>
                      No results for {tSearch ? <strong>"{tSearch}"</strong> : "this filter"}{tCat!=="All" ? <span> in <strong>{tCat}</strong></span> : ""}
                    </div>
                    <button onClick={()=>{setTSearch("");setTCat("All");}} style={bS}>Clear search</button>
                  </Cd>
                )}

                {/* Template grid */}
                {filtered.length>0 && (
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
                    {filtered.map(t => {
                      const isSel = selTpl?.id===t.id;
                      const typeColor = t.type==="Letter"?AC:t.type==="Email"?GR:t.type==="PDF"?RD:t.type==="Bundle"?PU:OR;
                      return (
                        <Cd key={t.id} style={{ padding:18, cursor:"pointer", border:`1.5px solid ${isSel?AC:BD}`, background:isSel?ACL:"#fff", transition:"all 0.15s" }} onClick={()=>setSelTpl(isSel?null:t)}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                            <span style={{ fontSize:11, background:`${typeColor}18`, color:typeColor, padding:"3px 8px", borderRadius:5, fontWeight:600 }}>{t.type}</span>
                            <Bdg label={t.status} color={t.status==="Active"?GR:t.status==="Draft"?AM:PU} light={t.status==="Active"?GL:t.status==="Draft"?AL:PL} />
                          </div>

                          {/* Highlight matching text */}
                          <div style={{ fontWeight:600, marginBottom:6, fontSize:13, color:isSel?AC:TP }}>
                            {tSearch ? t.name.split(new RegExp(`(${tSearch})`, "gi")).map((part,i)=>
                              part.toLowerCase()===tSearch.toLowerCase()
                                ? <span key={i} style={{ background:"#fef08a", borderRadius:2 }}>{part}</span>
                                : part
                            ) : t.name}
                          </div>

                          <div style={{ fontSize:11, color:TM, marginBottom:3 }}>
                            <span style={{ background:PG, padding:"2px 6px", borderRadius:4 }}>{t.cat}</span>
                          </div>
                          <div style={{ fontSize:11, color:TM, marginTop:6 }}>{t.ver} · Modified {t.mod}</div>
                          <div style={{ fontSize:11, color:TM, marginTop:2 }}>{t.uses.toLocaleString()} uses</div>

                          {isSel && (
                            <div style={{ marginTop:14, paddingTop:12, borderTop:`1px solid ${BD}` }}>
                              <button onClick={e=>{e.stopPropagation();setNav("compose");notify(`Using: ${t.name}`);}} style={{ ...bP, fontSize:11, padding:"6px 12px", width:"100%", marginBottom:8 }}>
                                ✏ Use This Template
                              </button>
                              <div style={{ display:"flex", gap:6 }}>
                                <button onClick={e=>{e.stopPropagation();notify("Duplicated");}} style={{ ...bS, fontSize:11, padding:"5px 0", flex:1 }}>⊕ Duplicate</button>
                                <button onClick={e=>{e.stopPropagation();notify("History opened");}} style={{ ...bS, fontSize:11, padding:"5px 0", flex:1 }}>⟳ History</button>
                              </div>
                            </div>
                          )}
                        </Cd>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ═══ COMPOSE ═══ */}
          {nav==="compose" && (
            <div>
              <PH title="Document Composer" sub="Create, customise and prepare documents for dispatch" />
              <div style={{ display:"flex", gap:6, marginBottom:20 }}>
                {["1 Search","2 Template","3 Content","4 Recipients","5 Distribution","6 Review"].map((s,i) => (
                  <div key={i} style={{ flex:1, padding:"10px 14px", borderRadius:8, background:composeStep===i+1?AC:composeStep>i+1?GL:PG, color:composeStep===i+1?"#fff":composeStep>i+1?GR:TM, fontSize:12, fontWeight:600, textAlign:"center", cursor:"pointer" }} onClick={()=>setComposeStep(i+1)}>{s}</div>
                ))}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:16 }}>
                <Cd style={{ padding:20 }}>
                  <SL>Step {composeStep} of 6</SL>
                  {/* ── STEP 1: Search ── */}
                  {composeStep===1 && (
                    <div>
                      <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>Find the customer, policy or claim</div>
                      <div style={{ fontSize:12, color:TM, marginBottom:16 }}>Search to associate this letter with a record before composing</div>

                      {/* Search type tabs */}
                      <div style={{ display:"flex", gap:0, marginBottom:14, border:`1px solid ${BD}`, borderRadius:8, overflow:"hidden" }}>
                        {[["policy","📋 Policy"],["customer","👤 Customer"],["claim","🗂 Claim"]].map(([t,l],i,arr)=>(
                          <button key={t} onClick={()=>{setSearchType(t);setSearchQuery("");setSelectedRecord(null);}}
                            style={{ flex:1, padding:"9px 0", border:"none", borderRight:i<arr.length-1?`1px solid ${BD}`:"none", cursor:"pointer", fontFamily:F, fontSize:12, fontWeight:600, background:searchType===t?AC:"#fff", color:searchType===t?"#fff":TS, transition:"all 0.15s" }}>{l}</button>
                        ))}
                      </div>

                      {/* Search input */}
                      <div style={{ position:"relative", marginBottom:12 }}>
                        <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:14, color:TM }}>🔍</span>
                        <input
                          type="text"
                          placeholder={searchType==="policy"?"Search by policy number, vehicle reg or product…":searchType==="customer"?"Search by name, email or postcode…":"Search by claim reference, date or status…"}
                          value={searchQuery}
                          onChange={e=>{setSearchQuery(e.target.value);setSelectedRecord(null);}}
                          style={{ ...iS, paddingLeft:36 }}
                        />
                      </div>

                      {/* Search results */}
                      {searchQuery.length>1 && !selectedRecord && (()=>{
                        const results = (SEARCH_DATA[searchType]||[]).filter(r=>
                          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.detail.toLowerCase().includes(searchQuery.toLowerCase())
                        );
                        if(results.length===0) return (
                          <div style={{ padding:16, textAlign:"center", color:TM, fontSize:13, background:PG, borderRadius:8 }}>No results found for "{searchQuery}"</div>
                        );
                        return (
                          <div style={{ border:`1px solid ${BD}`, borderRadius:8, overflow:"hidden" }}>
                            {results.map((r,i)=>(
                              <div key={r.id} onClick={()=>setSelectedRecord(r)}
                                style={{ padding:"12px 16px", borderBottom:i<results.length-1?`1px solid ${BD}`:"none", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", background:"#fff" }}>
                                <div>
                                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3, flexWrap:"wrap" }}>
                                    <span style={{ fontWeight:600, fontSize:13, color:TP }}>{r.name}</span>
                                    <span style={{ fontFamily:"monospace", fontSize:11, color:AC, background:ACL, padding:"1px 6px", borderRadius:3 }}>{r.ref}</span>
                                    <Bdg label={r.status} color={r.status==="Active"||r.status==="Open"?GR:r.status==="Lapsed"?AM:TS} light={r.status==="Active"||r.status==="Open"?GL:r.status==="Lapsed"?AL:PG} />
                                  </div>
                                  <div style={{ fontSize:12, color:TM }}>{r.detail}</div>
                                </div>
                                <span style={{ fontSize:18, color:AC, marginLeft:12, flexShrink:0 }}>&#8594;</span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}

                      {/* Selected record — claim party selection sub-step */}
                      {selectedRecord && selectedRecord.type==="claim" && !claimPartyStep && (
                        <div>
                          <div style={{ background:GL, border:`1px solid ${GR}40`, borderRadius:8, padding:"12px 16px", marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                            <div>
                              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                                <span style={{ fontSize:13, fontWeight:700, color:"#16a34a" }}>✓ Claim selected</span>
                                <span style={{ fontFamily:"monospace", fontSize:11, color:AC, background:ACL, padding:"1px 6px", borderRadius:3 }}>{selectedRecord.ref}</span>
                              </div>
                              <div style={{ fontSize:13, fontWeight:600, color:TP }}>{selectedRecord.name}</div>
                              <div style={{ fontSize:12, color:TM, marginTop:2 }}>{selectedRecord.detail}</div>
                            </div>
                            <button onClick={()=>{setSelectedRecord(null);setSelectedParty(null);}} style={{ ...bS, fontSize:11, padding:"4px 10px", flexShrink:0 }}>Change</button>
                          </div>
                          <button onClick={()=>setClaimPartyStep(true)} style={{ ...bP, width:"100%" }}>
                            Select Involved Party &#8594;
                          </button>
                        </div>
                      )}

                      {/* Claim party selection sub-step */}
                      {selectedRecord && selectedRecord.type==="claim" && claimPartyStep && (
                        <div>
                          {/* Claim summary banner */}
                          <div style={{ background:ACL, border:`1px solid ${AC}30`, borderRadius:8, padding:"10px 14px", marginBottom:16, display:"flex", alignItems:"center", gap:10 }}>
                            <span style={{ fontSize:16 }}>🗂</span>
                            <div style={{ flex:1 }}>
                              <div style={{ fontSize:12, fontWeight:700, color:AC }}>{selectedRecord.ref}</div>
                              <div style={{ fontSize:12, color:TS }}>{selectedRecord.detail}</div>
                            </div>
                            <button onClick={()=>{setClaimPartyStep(false);setSelectedParty(null);}} style={{ ...bS, fontSize:11, padding:"4px 10px", flexShrink:0 }}>Back</button>
                          </div>

                          <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>Who is this letter addressed to?</div>
                          <div style={{ fontSize:12, color:TM, marginBottom:14 }}>Select the involved party on this claim</div>

                          {/* Party cards */}
                          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
                            {(CLAIM_PARTIES[selectedRecord.ref]||[]).map(party=>{
                              const sel = selectedParty && selectedParty.id===party.id;
                              return (
                                <div key={party.id} onClick={()=>setSelectedParty(party)}
                                  style={{ padding:"12px 14px", borderRadius:8, cursor:"pointer", border:`1.5px solid ${sel?AC:BD}`, background:sel?ACL:"#fff", transition:"all 0.15s" }}>
                                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                                    <div style={{ flex:1 }}>
                                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                                        <span style={{ fontSize:11, fontWeight:700, color:sel?AC:"#fff", background:sel?ACL:AC, padding:"2px 8px", borderRadius:20, border:`1px solid ${AC}` }}>{party.role}</span>
                                      </div>
                                      <div style={{ fontSize:13, fontWeight:600, color:sel?AC:TP, marginBottom:2 }}>{party.name}</div>
                                      <div style={{ fontSize:11, color:TM }}>{party.contact}</div>
                                      <div style={{ fontSize:11, color:TM }}>{party.address}</div>
                                    </div>
                                    <div style={{ width:20, height:20, borderRadius:"50%", border:`2px solid ${sel?AC:BD}`, background:sel?AC:"#fff", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", marginLeft:10 }}>
                                      {sel && <div style={{ width:8, height:8, borderRadius:"50%", background:"#fff" }}/>}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Confirm party */}
                          <button
                            onClick={()=>{ if(!selectedParty){notify("Please select an involved party","error");return;} setComposeStep(2); }}
                            style={{ ...bP, width:"100%", opacity:selectedParty?1:0.5 }}>
                            Continue to Template Selection &#8594;
                          </button>
                        </div>
                      )}

                      {/* Selected record confirmation — non-claim records */}
                      {selectedRecord && selectedRecord.type!=="claim" && (
                        <div>
                          <div style={{ background:GL, border:`1px solid ${GR}40`, borderRadius:8, padding:"12px 16px", marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                            <div>
                              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                                <span style={{ fontSize:13, fontWeight:700, color:"#16a34a" }}>✓ Associated</span>
                                <span style={{ fontFamily:"monospace", fontSize:11, color:AC, background:ACL, padding:"1px 6px", borderRadius:3 }}>{selectedRecord.ref}</span>
                              </div>
                              <div style={{ fontSize:13, fontWeight:600, color:TP }}>{selectedRecord.name}</div>
                              <div style={{ fontSize:12, color:TM, marginTop:2 }}>{selectedRecord.detail}</div>
                            </div>
                            <button onClick={()=>setSelectedRecord(null)} style={{ ...bS, fontSize:11, padding:"4px 10px", flexShrink:0 }}>Change</button>
                          </div>
                          <button onClick={()=>setComposeStep(2)} style={{ ...bP, width:"100%" }}>
                            Continue to Template Selection &#8594;
                          </button>
                        </div>
                      )}

                      {/* Skip option */}
                      {!selectedRecord && (
                        <div style={{ marginTop:16, textAlign:"center" }}>
                          <button onClick={()=>setComposeStep(2)} style={{ background:"none", border:"none", color:TM, fontSize:12, cursor:"pointer", fontFamily:F, textDecoration:"underline" }}>
                            Skip — compose without associating a record
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── STEP 2: Template / Mode selection ── */}
                  {composeStep===2 && (
                    <div>
                      <div style={{ display:"flex", gap:8, marginBottom:20, padding:4, background:PG, borderRadius:10 }}>
                        {[["template","📄 Template"],["adhoc","✨ AI Draft"],["blank","✏️ Write My Own"]].map(([m,l])=>(
                          <button key={m} onClick={()=>{setComposeMode(m);setAiDraft("");}} style={{ flex:1, padding:"9px 0", borderRadius:7, border:"none", cursor:"pointer", fontFamily:F, fontSize:12, fontWeight:600, background:composeMode===m?"#fff":PG, color:composeMode===m?AC:TS, boxShadow:composeMode===m?"0 1px 4px rgba(0,0,0,0.10)":"none", transition:"all 0.15s" }}>{l}</button>
                        ))}
                      </div>

                      {/* ── Template mode ── */}
                      {composeMode==="template" && (()=>{
                        const cats = ["All","Renewals","Claims","Certificates","Onboarding","Endorsements","Cancellations"];
                        const filtered = (dbTemplates.length ? dbTemplates : TEMPLATES).filter(t => {
                          const q = cSearch.trim().toLowerCase();
                          const matchSearch = !q || t.name.toLowerCase().includes(q) || t.type.toLowerCase().includes(q) || t.cat.toLowerCase().includes(q) || t.ver.toLowerCase().includes(q);
                          const matchCat = cCat==="All" || t.cat===cCat;
                          return matchSearch && matchCat;
                        });
                        return (
                          <div>
                            {/* Search input */}
                            <div style={{ position:"relative", marginBottom:10 }}>
                              <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", fontSize:13, color:TM, pointerEvents:"none" }}>🔍</span>
                              <input
                                placeholder="Search templates by name, type or category…"
                                value={cSearch}
                                onChange={e=>{setCSearch(e.target.value);}}
                                style={{ ...iS, paddingLeft:32, fontSize:12 }}
                                autoFocus
                              />
                              {cSearch && (
                                <button onClick={()=>setCSearch("")} style={{ position:"absolute", right:9, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:14, color:TM, lineHeight:1 }}>✕</button>
                              )}
                            </div>

                            {/* Category pills */}
                            <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center", marginBottom:12 }}>
                              {cats.map(c=>(
                                <button key={c} onClick={()=>setCCat(c)} style={{ padding:"3px 10px", borderRadius:20, fontSize:11, cursor:"pointer", fontFamily:F, fontWeight:cCat===c?700:400, background:cCat===c?AC:"#fff", color:cCat===c?"#fff":TS, border:`1px solid ${cCat===c?AC:BD}`, transition:"all 0.12s" }}>{c}</button>
                              ))}
                              <span style={{ marginLeft:"auto", fontSize:11, color:TM }}>{filtered.length} of {TEMPLATES.length}</span>
                            </div>

                            {/* Empty state */}
                            {filtered.length===0 && (
                              <div style={{ padding:"24px 16px", textAlign:"center", background:PG, borderRadius:8 }}>
                                <div style={{ fontSize:24, marginBottom:6 }}>🔍</div>
                                <div style={{ fontSize:13, fontWeight:600, color:TP, marginBottom:4 }}>No templates found</div>
                                <div style={{ fontSize:12, color:TM, marginBottom:12 }}>Try a different search or category</div>
                                <button onClick={()=>{setCSearch("");setCCat("All");}} style={bS}>Clear search</button>
                              </div>
                            )}

                            {/* Template list */}
                            {filtered.map(t => {
                              const typeColor = t.type==="Letter"?AC:t.type==="Email"?GR:t.type==="PDF"?RD:t.type==="Bundle"?PU:OR;
                              const q = cSearch.trim();
                              const highlighted = q
                                ? t.name.split(new RegExp(`(${q})`, "gi")).map((part,i)=>
                                    part.toLowerCase()===q.toLowerCase()
                                      ? <span key={i} style={{ background:"#fef08a", borderRadius:2 }}>{part}</span>
                                      : part
                                  )
                                : t.name;
                              return (
                                <div key={t.id}
                                  onClick={()=>{setAiDraft("");setComposeStep(3);}}
                                  style={{ padding:"11px 14px", borderRadius:8, border:`1px solid ${BD}`, marginBottom:8, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", background:"#fff", transition:"border-color 0.12s" }}>
                                  <div style={{ flex:1, minWidth:0 }}>
                                    <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:3 }}>
                                      <span style={{ fontSize:10, fontWeight:700, color:typeColor, background:`${typeColor}18`, padding:"2px 7px", borderRadius:4, flexShrink:0 }}>{t.type}</span>
                                      <span style={{ fontWeight:600, fontSize:13, color:TP }}>{highlighted}</span>
                                    </div>
                                    <div style={{ fontSize:11, color:TM }}>{t.cat} · {t.ver} · {t.uses.toLocaleString()} uses</div>
                                  </div>
                                  <Bdg label={t.status} color={t.status==="Active"?GR:t.status==="Draft"?AM:PU} light={t.status==="Active"?GL:t.status==="Draft"?AL:PL} />
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}

                      {/* ── AI Draft mode ── */}
                      {composeMode==="adhoc" && (
                        <div>
                          <div style={{ background:`linear-gradient(135deg,${ACL},#f0f4ff)`, borderRadius:10, padding:14, marginBottom:16, border:`1px solid ${AC}30` }}>
                            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                              <span style={{ fontSize:20 }}>✨</span>
                              <div style={{ fontSize:14, fontWeight:700, color:AC }}>AI Letter Generator</div>
                            </div>
                            <div style={{ fontSize:12, color:TS }}>Describe what you want the letter to say and AI will write it, formatted with the RDT letterhead ready to review and edit.</div>
                          </div>

                          {/* Recipient type */}
                          <div style={{ marginBottom:12 }}>
                            <label style={{ fontSize:12, fontWeight:600, color:TS, display:"block", marginBottom:5 }}>Recipient type</label>
                            <select value={aiRecipient} onChange={e=>setAiRecipient(e.target.value)} style={iS}>
                              <option value="">Select recipient…</option>
                              <option value="policyholder">Policyholder</option>
                              <option value="broker">Broker</option>
                              <option value="claimant">Claimant</option>
                              <option value="third party">Third Party</option>
                              <option value="legal representative">Legal Representative</option>
                            </select>
                          </div>

                          {/* Tone */}
                          <div style={{ marginBottom:12 }}>
                            <label style={{ fontSize:12, fontWeight:600, color:TS, display:"block", marginBottom:8 }}>Tone</label>
                            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                              {[["professional","Professional"],["formal","Formal"],["empathetic","Empathetic"],["firm","Firm"],["friendly","Friendly"]].map(([v,l])=>(
                                <button key={v} onClick={()=>setAiTone(v)} style={{ padding:"5px 14px", borderRadius:20, fontSize:12, cursor:"pointer", fontFamily:F, fontWeight:aiTone===v?600:400, background:aiTone===v?AC:"#fff", color:aiTone===v?"#fff":TS, border:`1px solid ${aiTone===v?AC:BD}` }}>{l}</button>
                              ))}
                            </div>
                          </div>

                          {/* Main free-text prompt */}
                          <div style={{ marginBottom:14 }}>
                            <label style={{ fontSize:12, fontWeight:600, color:TS, display:"block", marginBottom:5 }}>What should this letter say?</label>
                            <textarea
                              placeholder={"Describe the letter in as much detail as you like.\n\ne.g. Write a renewal reminder for a motor insurance customer. Their policy expires on 31 March. They have 5 years no-claims discount. Mention we can offer a loyalty discount if they call us. Keep it warm but professional, under 200 words."}
                              value={aiPrompt}
                              onChange={e=>setAiPrompt(e.target.value)}
                              style={{ ...iS, height:130, resize:"vertical", fontSize:12, lineHeight:1.6 }}
                            />
                          </div>

                          {/* Generate button */}
                          <button
                            onClick={async ()=>{
                              if(!aiRecipient){notify("Please select a recipient type","error");return;}
                              if(!aiPrompt.trim()){notify("Please describe what the letter should say","error");return;}
                              setAiGenerating(true);
                              setAiDraft("");
                              try {
                                const res = await fetch("https://api.anthropic.com/v1/messages",{
                                  method:"POST",
                                  headers:{"Content-Type":"application/json"},
                                  body:JSON.stringify({
                                    model:"claude-sonnet-4-20250514",
                                    max_tokens:1000,
                                    messages:[{
                                      role:"user",
                                      content:`You are a professional insurance correspondence writer for RDT Limited, an insurance technology company based in Birmingham, UK.

Write the BODY CONTENT ONLY of a letter based on the following instructions:

Recipient: ${aiRecipient}
Tone: ${aiTone}
Instructions: ${aiPrompt}

Rules:
- Start with "Dear {{CUSTOMER_NAME}},"
- Where relevant, use merge fields in double curly braces: {{POLICY_NUMBER}}, {{RENEWAL_DATE}}, {{PREMIUM_AMOUNT}}, {{NCD_YEARS}}, {{CLAIM_REFERENCE}}
- Write 2-4 concise paragraphs
- End with "Yours sincerely,"
- Do NOT include letterhead, address block, signature block or date — those are added automatically
- Plain text only, no markdown, no bullet points`
                                    }]
                                  })
                                });
                                const data = await res.json();
                                const text = data.content?.find(b=>b.type==="text")?.text || "";
                                setAiDraft(text);
                                notify("Draft generated — review and edit below");
                              } catch(e) {
                                notify("Generation failed — please try again","error");
                              }
                              setAiGenerating(false);
                            }}
                            style={{ ...bP, width:"100%", marginBottom:aiDraft?14:0, opacity:aiGenerating?0.7:1 }}
                            disabled={aiGenerating}
                          >
                            {aiGenerating ? "✨ Generating draft…" : "✨ Generate Letter Draft"}
                          </button>

                          {/* Loading shimmer */}
                          {aiGenerating && (
                            <div style={{ marginTop:14 }}>
                              {[100,80,90,60,85].map((w,i)=>(
                                <div key={i} style={{ height:12, borderRadius:6, background:`linear-gradient(90deg,${BD} 25%,#e8eaf0 50%,${BD} 75%)`, backgroundSize:"200% 100%", animation:"shimmer 1.4s infinite", width:`${w}%`, marginBottom:10 }}/>
                              ))}
                              <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
                            </div>
                          )}

                          {/* Draft result */}
                          {aiDraft && !aiGenerating && (
                            <div>
                              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                                <div style={{ fontSize:12, fontWeight:600, color:GR }}>✓ Draft ready — review and edit</div>
                                <button onClick={()=>{setAiDraft("");setAiPrompt("");setAiRecipient("");}} style={{ ...bS, fontSize:11, padding:"4px 10px" }}>Clear</button>
                              </div>
                              <textarea
                                value={aiDraft}
                                onChange={e=>setAiDraft(e.target.value)}
                                style={{ ...iS, height:200, resize:"vertical", fontSize:12, lineHeight:1.7, fontFamily:"Georgia, serif" }}
                              />
                              <button onClick={()=>setComposeStep(3)} style={{ ...bP, width:"100%", marginTop:10 }}>
                                Use This Draft — Continue to Review
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ── Write My Own (blank) mode ── */}
                      {composeMode==="blank" && (
                        <div>
                          <div style={{ background:`linear-gradient(135deg,#f5f5ff,#fff)`, borderRadius:10, padding:14, marginBottom:16, border:`1px solid ${BD}` }}>
                            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                              <span style={{ fontSize:20 }}>✏️</span>
                              <div style={{ fontSize:14, fontWeight:700, color:TP }}>Write Your Own Letter</div>
                            </div>
                            <div style={{ fontSize:12, color:TS }}>Start from a blank RDT letterhead. Write your letter content below — merge fields will be highlighted automatically.</div>
                          </div>

                          {/* Merge field helper chips */}
                          <div style={{ marginBottom:12 }}>
                            <label style={{ fontSize:12, fontWeight:600, color:TS, display:"block", marginBottom:7 }}>Insert merge fields</label>
                            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                              {["CUSTOMER_NAME","POLICY_NUMBER","RENEWAL_DATE","PREMIUM_AMOUNT","NCD_YEARS","ADDRESS_LINE1","POSTCODE","CLAIM_REFERENCE","DATE"].map(f=>(
                                <button key={f} onClick={()=>setAiDraft(d=>d+`{{${f}}}`)} style={{ padding:"3px 10px", borderRadius:20, fontSize:11, cursor:"pointer", fontFamily:"monospace", background:ACL, color:AC, border:`1px solid ${AC}40`, fontWeight:500 }}>{`{{${f}}}`}</button>
                              ))}
                            </div>
                          </div>

                          {/* Blank writing area */}
                          <div style={{ marginBottom:12 }}>
                            <label style={{ fontSize:12, fontWeight:600, color:TS, display:"block", marginBottom:5 }}>Letter content</label>
                            <div style={{ fontSize:11, color:TM, marginBottom:6 }}>{"Start with \"Dear {{CUSTOMER_NAME}},\" and end with \"Yours sincerely,\""}</div>
                            <textarea
                              placeholder={"Dear {{CUSTOMER_NAME}},\n\nWrite your letter here…\n\nYours sincerely,"}
                              value={aiDraft}
                              onChange={e=>setAiDraft(e.target.value)}
                              style={{ ...iS, height:240, resize:"vertical", fontSize:13, lineHeight:1.8, fontFamily:"Georgia, serif" }}
                            />
                          </div>

                          {/* Live word count */}
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                            <span style={{ fontSize:11, color:TM }}>{aiDraft.trim().split(/\s+/).filter(Boolean).length} words</span>
                            {aiDraft && <button onClick={()=>setAiDraft("")} style={{ ...bS, fontSize:11, padding:"4px 10px" }}>Clear</button>}
                          </div>

                          <button
                            onClick={()=>{ if(!aiDraft.trim()){notify("Please write your letter content first","error");return;} setComposeStep(3); }}
                            style={{ ...bP, width:"100%", opacity:aiDraft.trim()?1:0.5 }}
                          >
                            Preview on Letterhead — Continue
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {composeStep===3 && (()=>{ const letterBody = aiDraft || TEMPLATE_BODY; return (
                    <div>
                      {/* Toolbar */}
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
                        {["B","I","U","H1","H2","Link","Table","If-Then"].map(t=>(
                          <button key={t} onClick={()=>notify(`${t} applied`)} style={{ padding:"4px 10px", background:"#fff", border:`1px solid ${BD}`, borderRadius:5, color:TS, fontSize:12, cursor:"pointer", fontFamily:F }}>{t}</button>
                        ))}
                      </div>

                      {/* Letter paper */}
                      <div style={{ background:"#fff", border:`1px solid ${BD}`, borderRadius:8, overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,0.08)", fontSize:13, color:"#1a1a1a", fontFamily:"Georgia, serif" }}>

                        {/* Letterhead */}
                        <div style={{ padding:"20px 28px 14px", borderBottom:"3px solid #eb5f0a", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                          <img src={RDT_LOGO} alt="RDT" style={{ height:66, width:198, objectFit:"contain" }} />
                          <div style={{ textAlign:"right", fontSize:11, color:"#555", lineHeight:1.7, fontFamily:F }}>
                            <div style={{ fontWeight:700, color:"#1a1a1a", fontSize:12 }}>RDT Limited</div>
                            <div>Kings Court, 17 School Road</div>
                            <div>Birmingham, B28 8JG</div>
                            <div>info@rdtltd.com</div>
                          </div>
                        </div>

                        {/* Letter body */}
                        <div style={{ padding:"20px 28px 16px" }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16, fontSize:12, color:"#555", fontFamily:F }}>
                            <span>Ref: <span style={{ background:ACL, color:AC, padding:"1px 4px", borderRadius:3, fontFamily:"monospace" }}>{"{{POLICY_NUMBER}}"}</span></span>
                            <span>Date: <span style={{ background:ACL, color:AC, padding:"1px 4px", borderRadius:3, fontFamily:"monospace" }}>{"{{DATE}}"}</span></span>
                          </div>

                          <div style={{ marginBottom:16, fontSize:12, lineHeight:1.7, fontFamily:F }}>
                            <div style={{ background:ACL, color:AC, padding:"1px 4px", borderRadius:3, fontFamily:"monospace", display:"inline" }}>{"{{CUSTOMER_NAME}}"}</div><br/>
                            <div style={{ background:ACL, color:AC, padding:"1px 4px", borderRadius:3, fontFamily:"monospace", display:"inline" }}>{"{{ADDRESS_LINE1}}"}</div><br/>
                            <div style={{ background:ACL, color:AC, padding:"1px 4px", borderRadius:3, fontFamily:"monospace", display:"inline" }}>{"{{POSTCODE}}"}</div>
                          </div>

                          <p style={{ marginBottom:12, lineHeight:1.8 }}>Dear <span style={{ background:ACL, color:AC, padding:"1px 4px", borderRadius:3, fontFamily:"monospace", fontSize:12 }}>{"{{CUSTOMER_NAME}}"}</span>,</p>

                          {/* AI-generated or template body */}
                          {aiDraft ? (
                            <div>
                              <div style={{ background:composeMode==="blank"?PG:ACL, borderRadius:6, padding:"4px 10px", marginBottom:10, display:"inline-flex", alignItems:"center", gap:6, fontSize:11, color:composeMode==="blank"?TS:AC, fontWeight:600 }}>
                                <span>{composeMode==="blank"?"✏️":"✨"}</span> {composeMode==="blank"?"Your own content":"AI-generated draft"}
                              </div>
                              <div style={{ lineHeight:1.8, whiteSpace:"pre-wrap", color:"#333", fontFamily:"Georgia, serif", fontSize:13 }}>
                                {letterBody.replace(/^Dear \{\{CUSTOMER_NAME\}\},?\n?/,"").split(/(\{\{[A-Z_]+\}\})/).map((part,i)=>
                                  /^\{\{[A-Z_]+\}\}$/.test(part)
                                    ? <span key={i} style={{ background:ACL, color:AC, padding:"1px 4px", borderRadius:3, fontFamily:"monospace", fontSize:12 }}>{part}</span>
                                    : part
                                )}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p style={{ marginBottom:10, fontWeight:700, fontSize:13 }}>Re: Policy Renewal — <span style={{ background:ACL, color:AC, padding:"1px 4px", borderRadius:3, fontFamily:"monospace", fontSize:12 }}>{"{{POLICY_NUMBER}}"}</span></p>
                              <p style={{ marginBottom:10, lineHeight:1.8 }}>
                                Your policy is due for renewal on <span style={{ background:ACL, color:AC, padding:"1px 4px", borderRadius:3, fontFamily:"monospace", fontSize:12 }}>{"{{RENEWAL_DATE}}"}</span>. Your renewal premium is <span style={{ background:ACL, color:AC, padding:"1px 4px", borderRadius:3, fontFamily:"monospace", fontSize:12 }}>{"{{PREMIUM_AMOUNT}}"}</span>.
                              </p>
                              <p style={{ marginBottom:16, lineHeight:1.8, color:"#444" }}>
                                To accept your renewal, please contact us on 0121 000 0000 or visit your online account. If you have any questions, our team is happy to help.
                              </p>
                            </div>
                          )}
                          <p style={{ marginBottom:20, marginTop:16, lineHeight:1.8 }}>Yours sincerely,</p>

                          {/* Signature block */}
                          <div style={{ borderTop:`1px solid ${BD}`, paddingTop:14, display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
                            <div>
                              <div style={{ fontSize:16, fontStyle:"italic", color:"#333", marginBottom:4, fontFamily:"Georgia, serif" }}>Sarah Kent</div>
                              <div style={{ fontSize:12, fontWeight:600, color:TP, fontFamily:F }}>Sarah Kent</div>
                              <div style={{ fontSize:11, color:TS, fontFamily:F }}>Doc Administrator</div>
                              <div style={{ fontSize:11, color:TS, fontFamily:F }}>RDT Limited</div>
                            </div>
                            <div style={{ textAlign:"right", fontSize:10, color:TM, fontFamily:F, lineHeight:1.6 }}>
                              <div>s.kent@rdtltd.com</div>
                              <div>0121 000 0000</div>
                            </div>
                          </div>
                        </div>

                        {/* Letter footer */}
                        <div style={{ background:"#1a1f2e", padding:"10px 28px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                          <div style={{ fontSize:10, color:"rgba(255,255,255,0.6)", fontFamily:F, lineHeight:1.6 }}>
                            <span>RDT Limited · Registered in England &amp; Wales No. 12345678</span>
                          </div>
                          <div style={{ fontSize:10, color:"rgba(255,255,255,0.5)", fontFamily:F }}>
                            Prepared by: <span style={{ color:"rgba(255,255,255,0.8)", fontWeight:600 }}>{userEmail}</span>
                          </div>
                        </div>
                      </div>

                      {/* ── Language Translation Panel ── */}
                      <div style={{ border:`1px solid ${BD}`, borderRadius:10, overflow:"hidden", marginTop:16 }}>
                        {/* Toggle header */}
                        <button onClick={()=>setTransOpen(p=>!p)} style={{ width:"100%", padding:"12px 16px", background:transOpen?ACL:"#fafbff", border:"none", cursor:"pointer", fontFamily:F, display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:transOpen?`1px solid ${BD}`:"none" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <span style={{ fontSize:18 }}>🌐</span>
                            <div style={{ textAlign:"left" }}>
                              <div style={{ fontSize:13, fontWeight:600, color:transOpen?AC:TP }}>Translate Letter</div>
                              <div style={{ fontSize:11, color:TM }}>Use AI to rewrite this letter in another language</div>
                            </div>
                          </div>
                          <span style={{ fontSize:12, color:TM, transform:transOpen?"rotate(180deg)":"none", transition:"transform 0.2s" }}>▼</span>
                        </button>

                        {transOpen && (
                          <div style={{ padding:16 }}>
                            <div style={{ fontSize:12, color:TM, marginBottom:14 }}>
                              Select a language below. The AI will translate the letter body while preserving merge fields and formatting. The original English version is kept alongside for reference.
                            </div>

                            {/* Language grid */}
                            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:14 }}>
                              {[
                                { code:"fr", label:"French",     flag:"🇫🇷" },
                                { code:"de", label:"German",     flag:"🇩🇪" },
                                { code:"es", label:"Spanish",    flag:"🇪🇸" },
                                { code:"pl", label:"Polish",     flag:"🇵🇱" },
                                { code:"ur", label:"Urdu",       flag:"🇵🇰" },
                                { code:"pa", label:"Punjabi",    flag:"🇮🇳" },
                                { code:"ar", label:"Arabic",     flag:"🇸🇦" },
                                { code:"zh", label:"Mandarin",   flag:"🇨🇳" },
                                { code:"ro", label:"Romanian",   flag:"🇷🇴" },
                                { code:"so", label:"Somali",     flag:"🇸🇴" },
                                { code:"bn", label:"Bengali",    flag:"🇧🇩" },
                                { code:"cy", label:"Welsh",      flag:"🏴󠁧󠁢󠁷󠁬󠁳󠁿" },
                              ].map(l=>(
                                <button key={l.code} onClick={()=>setTransLang(l.code===transLang?"":l.code)}
                                  style={{ padding:"8px 10px", borderRadius:8, cursor:"pointer", border:`1.5px solid ${transLang===l.code?AC:BD}`, background:transLang===l.code?ACL:"#fff", fontFamily:F, display:"flex", alignItems:"center", gap:7, transition:"all 0.15s" }}>
                                  <span style={{ fontSize:16 }}>{l.flag}</span>
                                  <span style={{ fontSize:12, fontWeight:transLang===l.code?600:400, color:transLang===l.code?AC:TP }}>{l.label}</span>
                                  {transLang===l.code && <span style={{ marginLeft:"auto", fontSize:10, color:AC, fontWeight:700 }}>✓</span>}
                                </button>
                              ))}
                            </div>

                            {/* Translate button */}
                            <button
                              disabled={!transLang||transGenerating}
                              onClick={async ()=>{
                                
                                const langNames = {fr:"French",de:"German",es:"Spanish",pl:"Polish",ur:"Urdu",pa:"Punjabi",ar:"Arabic",zh:"Mandarin Chinese",ro:"Romanian",so:"Somali",bn:"Bengali",cy:"Welsh"};
                                const targetLang = langNames[transLang]||transLang;
                                setTransGenerating(true);
                                try {
                                  const res = await fetch("https://api.anthropic.com/v1/messages",{
                                    method:"POST",
                                    headers:{"Content-Type":"application/json"},
                                    body:JSON.stringify({
                                      model:"claude-sonnet-4-20250514",
                                      max_tokens:1200,
                                      messages:[{
                                        role:"user",
                                        content:`You are a professional translator specialising in insurance and legal correspondence.

Translate the following insurance letter into ${targetLang}.

Rules:
- Translate ALL natural language text into ${targetLang}
- Keep ALL merge fields EXACTLY as they are in double curly braces, e.g. {{CUSTOMER_NAME}}, {{POLICY_NUMBER}} — do NOT translate these
- Keep "Dear {{CUSTOMER_NAME}}," and "Yours sincerely," translated into ${targetLang} equivalents
- Maintain a professional, formal tone appropriate for insurance correspondence
- Output ONLY the translated letter body — no explanations, no preamble

Letter to translate:
${letterBody}`
                                      }]
                                    })
                                  });
                                  const data = await res.json();
                                  const translated = data.content?.find(b=>b.type==="text")?.text||"";
                                  setAiDraft(translated);
                                  notify(`Letter translated to ${targetLang}`);
                                  setTransOpen(false);
                                } catch(e){
                                  notify("Translation failed — please try again","error");
                                }
                                setTransGenerating(false);
                              }}
                              style={{ ...bP, width:"100%", opacity:(!transLang||transGenerating)?0.5:1 }}>
                              {transGenerating ? "🌐 Translating…" : transLang ? `🌐 Translate to ${({fr:"French",de:"German",es:"Spanish",pl:"Polish",ur:"Urdu",pa:"Punjabi",ar:"Arabic",zh:"Mandarin",ro:"Romanian",so:"Somali",bn:"Bengali",cy:"Welsh"})[transLang]}` : "🌐 Select a language above"}
                            </button>

                            {/* Shimmer while translating */}
                            {transGenerating && (
                              <div style={{ marginTop:14 }}>
                                {[100,75,90,55,80].map((w,i)=>(
                                  <div key={i} style={{ height:11, borderRadius:6, background:`linear-gradient(90deg,${BD} 25%,#e8eaf0 50%,${BD} 75%)`, backgroundSize:"200% 100%", animation:"shimmer 1.4s infinite", width:`${w}%`, marginBottom:9 }}/>
                                ))}
                              </div>
                            )}


                          </div>
                        )}
                      </div>

                      <div style={{ display:"flex", gap:10, marginTop:12 }}>
                        <button onClick={()=>setComposeStep(4)} style={{ ...bP, flex:1 }}>Save &amp; Continue</button>
                        <button onClick={()=>{ setComposeStep(1); setSelectedRecord(null); setSearchQuery(""); setAiDraft(""); setAiPrompt(""); setAiRecipient(""); setComposeMode("template"); setSelectedParty(null); setClaimPartyStep(false); setTransLang(""); setTransOpen(false); setCSearch(""); setCCat("All"); notify("Letter discarded","error"); }} style={{ ...bS, padding:"8px 18px", color:RD, border:`1px solid ${RD}`, background:"#fff" }}>🗑 Discard</button>
                      </div>
                    </div>
                  )})()}
                  {composeStep===4 && (
                    <div>
                      <div style={{ marginBottom:12 }}>
                        <label style={{ fontSize:12, color:TS, display:"block", marginBottom:5 }}>Recipient source</label>
                        <select style={iS}><option>PAS extract — all renewing policies</option><option>Manual upload (CSV)</option><option>Single recipient</option></select>
                      </div>
                      <div style={{ background:PG, borderRadius:8, padding:14, fontSize:13, marginBottom:12 }}>
                        <div style={{ fontWeight:600, marginBottom:4 }}>Preview count</div>
                        <div style={{ fontSize:24, fontWeight:700, color:AC }}>4,200</div>
                        <div style={{ fontSize:12, color:TM }}>recipients matched</div>
                      </div>
                      <button onClick={()=>setComposeStep(5)} style={{ ...bP, width:"100%" }}>Confirm Recipients</button>
                    </div>
                  )}

                  {composeStep===5 && (
                    <div>
                      <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>Select distribution channels</div>
                      <div style={{ fontSize:12, color:TM, marginBottom:16 }}>Choose how this letter will be delivered to recipients</div>

                      {/* Channel cards */}
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
                        {[
                          { id:"print",  icon:"🖨️", label:"Central Print",    desc:"Mailing house dispatch" },
                          { id:"email",  icon:"✉️", label:"Email",            desc:"PDF attachment or inline" },
                          { id:"portal", icon:"🌐", label:"Customer Portal",  desc:"Self-service inbox" },
                          { id:"sms",    icon:"💬", label:"SMS Notification", desc:"Link to online version" },
                          { id:"wa",     icon:"__WA__", label:"WhatsApp",         desc:"WhatsApp Business API" },
                          { id:"archive",icon:"🗄️", label:"Archive Only",     desc:"Store without sending" },
                        ].map(ch => {
                          const sel = distChannels.includes(ch.id);
                          return (
                            <div key={ch.id} onClick={()=>setDistChannels(p=>p.includes(ch.id)?p.filter(c=>c!==ch.id):[...p,ch.id])}
                              style={{ padding:"12px 14px", borderRadius:8, cursor:"pointer", border:`1.5px solid ${sel?AC:BD}`, background:sel?ACL:"#fff", transition:"all 0.15s" }}>
                              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                                <Icon v={ch.icon} size={20} />
                                {sel && <span style={{ fontSize:11, color:AC, fontWeight:700 }}>✓</span>}
                              </div>
                              <div style={{ fontWeight:600, fontSize:13, marginTop:6, color:sel?AC:TP }}>{ch.label}</div>
                              <div style={{ fontSize:11, color:TM, marginTop:2 }}>{ch.desc}</div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Email configuration panel — slides in when email selected */}
                      {distChannels.includes("email") && (
                        <div style={{ border:`1.5px solid ${AC}`, borderRadius:10, overflow:"hidden", marginBottom:16, background:"#fff" }}>
                          {/* Panel header */}
                          <div style={{ background:ACL, padding:"12px 16px", borderBottom:`1px solid ${AC}30`, display:"flex", alignItems:"center", gap:10 }}>
                            <span style={{ fontSize:18 }}>✉️</span>
                            <div style={{ flex:1 }}>
                              <div style={{ fontSize:13, fontWeight:700, color:AC }}>Email Configuration</div>
                              <div style={{ fontSize:11, color:TS }}>Configure email addresses and delivery settings</div>
                            </div>
                          </div>

                          {/* Sub-tabs */}
                          <div style={{ display:"flex", borderBottom:`1px solid ${BD}`, background:"#fafbff" }}>
                            {[["recipients","📋 Recipients"],["sender","📤 Sender"],["format","📄 Format"],["test","🧪 Test"]].map(([t,l])=>(
                              <button key={t} onClick={()=>setEmailTab(t)} style={{ padding:"8px 16px", border:"none", background:"transparent", fontFamily:F, fontSize:12, cursor:"pointer", fontWeight:emailTab===t?600:400, color:emailTab===t?AC:TS, borderBottom:emailTab===t?`2px solid ${AC}`:"2px solid transparent", marginBottom:-1 }}>{l}</button>
                            ))}
                          </div>

                          <div style={{ padding:16 }}>

                            {/* Recipients tab */}
                            {emailTab==="recipients" && (
                              <div>
                                <div style={{ fontSize:12, fontWeight:600, color:TS, marginBottom:10 }}>Email address source</div>
                                <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:14 }}>
                                  {[
                                    ["pas",    "Use PAS email addresses",           "Pull email from the policy administration system"],
                                    ["manual", "Enter email addresses manually",    "Type or paste a list of addresses"],
                                    ["upload", "Upload CSV file",                   "Import addresses from a spreadsheet"],
                                  ].map(([val,label,hint])=>(
                                    <div key={val} onClick={()=>setEmailConfig(p=>({...p,source:val}))}
                                      style={{ padding:"10px 14px", borderRadius:8, cursor:"pointer", border:`1.5px solid ${emailConfig.source===val?AC:BD}`, background:emailConfig.source===val?ACL:"#fff", transition:"all 0.15s" }}>
                                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                                        <div style={{ width:14, height:14, borderRadius:"50%", border:`2px solid ${emailConfig.source===val?AC:BD}`, background:emailConfig.source===val?AC:"#fff", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                                          {emailConfig.source===val && <div style={{ width:5, height:5, borderRadius:"50%", background:"#fff" }}/>}
                                        </div>
                                        <div>
                                          <div style={{ fontSize:13, fontWeight:600, color:emailConfig.source===val?AC:TP }}>{label}</div>
                                          <div style={{ fontSize:11, color:TM }}>{hint}</div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {emailConfig.source==="manual" && (
                                  <div>
                                    <label style={{ fontSize:12, fontWeight:600, color:TS, display:"block", marginBottom:6 }}>Email addresses <span style={{ color:TM, fontWeight:400 }}>(one per line or comma-separated)</span></label>
                                    <textarea
                                      placeholder={"john.smith@example.com\njane.doe@example.com\nor: john@example.com, jane@example.com"}
                                      value={emailConfig.manualList}
                                      onChange={e=>setEmailConfig(p=>({...p,manualList:e.target.value}))}
                                      style={{ ...iS, height:100, resize:"vertical", fontFamily:"monospace", fontSize:12 }}
                                    />
                                    {emailConfig.manualList && (
                                      <div style={{ marginTop:6, fontSize:12, color:GR, fontWeight:500 }}>
                                        ✓ {emailConfig.manualList.split(/[\n,]+/).filter(e=>e.trim().includes("@")).length} valid address(es) detected
                                      </div>
                                    )}
                                  </div>
                                )}

                                {emailConfig.source==="upload" && (
                                  <div style={{ border:`2px dashed ${BD}`, borderRadius:8, padding:20, textAlign:"center", color:TM, fontSize:13, cursor:"pointer", background:PG }}
                                    onClick={()=>notify("File browser opened")}>
                                    <div style={{ fontSize:28, marginBottom:6 }}>📂</div>
                                    <div style={{ fontWeight:500 }}>Click to upload CSV</div>
                                    <div style={{ fontSize:11, marginTop:4 }}>Column header must be <span style={{ fontFamily:"monospace", color:AC }}>email_address</span></div>
                                  </div>
                                )}

                                {emailConfig.source==="pas" && (
                                  <div style={{ background:GL, borderRadius:8, padding:12, fontSize:13, display:"flex", alignItems:"center", gap:10 }}>
                                    <span>✅</span>
                                    <span style={{ color:"#16a34a" }}><strong>4,200</strong> email addresses will be pulled from PAS at dispatch time</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Sender tab */}
                            {emailTab==="sender" && (
                              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                                {[
                                  ["From name",    "fromName",  "text",  "e.g. RDT Limited"],
                                  ["From address", "fromEmail", "email", "noreply@rdtltd.com"],
                                  ["Reply-to",     "replyTo",   "email", "renewals@rdtltd.com"],
                                  ["Subject line", "subject",   "text",  "Your Policy Renewal"],
                                ].map(([label,field,type,ph])=>(
                                  <div key={field} style={{ gridColumn: field==="subject"?"1 / -1":"auto" }}>
                                    <label style={{ fontSize:12, fontWeight:600, color:TS, display:"block", marginBottom:5 }}>{label}</label>
                                    <input type={type} placeholder={ph} value={emailConfig[field]} onChange={e=>setEmailConfig(p=>({...p,[field]:e.target.value}))} style={iS} />
                                  </div>
                                ))}
                                <div style={{ gridColumn:"1 / -1", background:AL, borderRadius:8, padding:10, fontSize:12, color:"#92400e" }}>
                                  ⚠️ The from address must be verified in your email service provider before sending
                                </div>
                              </div>
                            )}

                            {/* Format tab */}
                            {emailTab==="format" && (
                              <div>
                                <div style={{ fontSize:12, fontWeight:600, color:TS, marginBottom:10 }}>Email delivery format</div>
                                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                                  {[
                                    ["attachment", "PDF Attachment",    "Letter sent as a PDF file attached to the email"],
                                    ["inline",     "Inline HTML",       "Letter content rendered directly in the email body"],
                                    ["link",       "Secure Link",       "Email contains a link to view the letter in the portal"],
                                  ].map(([val,label,desc])=>(
                                    <div key={val} onClick={()=>setEmailConfig(p=>({...p,format:val}))}
                                      style={{ padding:"10px 14px", borderRadius:8, cursor:"pointer", border:`1.5px solid ${emailConfig.format===val?AC:BD}`, background:emailConfig.format===val?ACL:"#fff", transition:"all 0.15s", display:"flex", alignItems:"center", gap:12 }}>
                                      <div style={{ width:14, height:14, borderRadius:"50%", border:`2px solid ${emailConfig.format===val?AC:BD}`, background:emailConfig.format===val?AC:"#fff", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                                        {emailConfig.format===val && <div style={{ width:5, height:5, borderRadius:"50%", background:"#fff" }}/>}
                                      </div>
                                      <div>
                                        <div style={{ fontSize:13, fontWeight:600, color:emailConfig.format===val?AC:TP }}>{label}</div>
                                        <div style={{ fontSize:11, color:TM }}>{desc}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Test tab */}
                            {emailTab==="test" && (
                              <div>
                                <div style={{ fontSize:12, fontWeight:600, color:TS, marginBottom:6 }}>Send a test email</div>
                                <div style={{ fontSize:12, color:TM, marginBottom:12 }}>Preview how the email will appear before dispatching to all recipients</div>
                                <label style={{ fontSize:12, fontWeight:600, color:TS, display:"block", marginBottom:6 }}>Test email address</label>
                                <div style={{ display:"flex", gap:8 }}>
                                  <input
                                    type="email"
                                    placeholder="your.name@rdtltd.com"
                                    value={emailConfig.testEmail}
                                    onChange={e=>setEmailConfig(p=>({...p,testEmail:e.target.value}))}
                                    style={{ ...iS, flex:1 }}
                                  />
                                  <button onClick={()=>{ if(!emailConfig.testEmail){notify("Enter a test email address","error");return;} notify(`Test email sent to ${emailConfig.testEmail}`); }} style={{ ...bP, whiteSpace:"nowrap" }}>Send Test</button>
                                </div>
                                <div style={{ marginTop:14, background:PG, borderRadius:8, padding:12 }}>
                                  <div style={{ fontSize:12, fontWeight:600, color:TS, marginBottom:8 }}>Email preview summary</div>
                                  {[
                                    ["From",    `${emailConfig.fromName} <${emailConfig.fromEmail}>`],
                                    ["Reply-to",emailConfig.replyTo],
                                    ["Subject", emailConfig.subject],
                                    ["Format",  emailConfig.format==="attachment"?"PDF Attachment":emailConfig.format==="inline"?"Inline HTML":"Secure Link"],
                                    ["To (live)","4,200 PAS recipients"],
                                  ].map(([k,v])=>(
                                    <div key={k} style={{ display:"flex", gap:10, padding:"5px 0", borderBottom:`1px solid ${BD}`, fontSize:12 }}>
                                      <span style={{ color:TM, width:64, flexShrink:0 }}>{k}</span>
                                      <span style={{ color:TP, wordBreak:"break-all" }}>{v}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          </div>
                        </div>
                      )}
                      <div style={{ background:PG, borderRadius:8, padding:14, marginBottom:16 }}>
                        <div style={{ fontSize:12, fontWeight:600, color:TS, marginBottom:10 }}>Dispatch schedule</div>
                        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                          {[["immediate","Send immediately"],["scheduled","Schedule for later"],["approval","Hold for approval"]].map(([val,label])=>(
                            <label key={val} style={{ display:"flex", alignItems:"center", gap:10, fontSize:13, color:TS, cursor:"pointer" }}>
                              <div onClick={()=>setDistSchedule(val)}
                                style={{ width:16, height:16, borderRadius:"50%", flexShrink:0, border:`2px solid ${distSchedule===val?AC:BD}`, background:distSchedule===val?AC:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>
                                {distSchedule===val && <div style={{ width:6, height:6, borderRadius:"50%", background:"#fff" }}/>}
                              </div>
                              {label}
                            </label>
                          ))}
                        </div>
                        {distSchedule==="scheduled" && (
                          <input type="datetime-local" style={{ ...iS, marginTop:10 }} />
                        )}
                      </div>

                      {/* Priority & fallback */}
                      {distChannels.length > 1 && (
                        <div style={{ background:"#fff", border:`1px solid ${BD}`, borderRadius:8, padding:14, marginBottom:16 }}>
                          <div style={{ fontSize:12, fontWeight:600, color:TS, marginBottom:8 }}>Fallback order</div>
                          <div style={{ fontSize:12, color:TM, marginBottom:8 }}>If primary channel fails, attempt next in order</div>
                          {distChannels.map((ch,i)=>{
                            const info = [{id:"print",icon:"🖨️",label:"Central Print"},{id:"email",icon:"✉️",label:"Email"},{id:"portal",icon:"🌐",label:"Portal"},{id:"sms",icon:"💬",label:"SMS"},{id:"wa",icon:"__WA__",label:"WhatsApp"},{id:"archive",icon:"🗄️",label:"Archive"}].find(c=>c.id===ch);
                            return (
                              <div key={ch} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 0", borderBottom:i<distChannels.length-1?`1px solid ${BD}`:"none", fontSize:13 }}>
                                <span style={{ width:20, height:20, borderRadius:"50%", background:AC, color:"#fff", fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{i+1}</span>
                                <Icon v={info?.icon||""} size={15} />
                                <span style={{ flex:1 }}>{info?.label}</span>
                                <span style={{ fontSize:11, color:i===0?"#16a34a":TM, fontWeight:i===0?600:400 }}>{i===0?"Primary":"Fallback"}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <button
                        onClick={()=>{ if(!distChannels.length){notify("Please select at least one channel","error");return;} setComposeStep(6); }}
                        style={{ ...bP, width:"100%", opacity:distChannels.length?1:0.5 }}>
                        Confirm Distribution
                      </button>
                    </div>
                  )}

                  {composeStep===6 && (
                    <div>
                      {/* Summary card */}
                      <div style={{ background:GL, borderRadius:8, padding:16, marginBottom:14, borderLeft:`4px solid ${GR}` }}>
                        <div style={{ fontWeight:700, color:"#16a34a", marginBottom:6, fontSize:14 }}>Ready to dispatch</div>
                        <div style={{ fontSize:13, color:TS }}>4,200 documents · Policy Renewal Notice v3.2</div>
                      </div>

                      <div style={{ background:"#fff", border:`1px solid ${BD}`, borderRadius:8, overflow:"hidden", marginBottom:14 }}>
                        {[
                          ["Associated",  selectedRecord ? `${selectedRecord.name} · ${selectedRecord.ref}` : "No record associated"],
                          ...(selectedParty ? [["Party", `${selectedParty.name} · ${selectedParty.role}`]] : []),
                          ["Template",  "Policy Renewal Notice v3.2"],
                          ["Recipients","4,200 · PAS extract"],
                          ["Channels",  distChannels.length ? distChannels.map(c=>c.charAt(0).toUpperCase()+c.slice(1)).join(", ") : "—"],
                          ["Schedule",  distSchedule==="immediate"?"Send immediately":distSchedule==="scheduled"?"Scheduled":"Pending approval"],
                          ["Prepared by","", userEmail + " · Doc Administrator"],
                        ].map(([k,v],i,arr)=>(
                          <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"10px 14px", borderBottom:i<arr.length-1?`1px solid ${BD}`:"none", fontSize:13 }}>
                            <span style={{ color:TM, fontWeight:500 }}>{k}</span>
                            <span style={{ color:TP, fontWeight:600, textAlign:"right", maxWidth:"60%" }}>{v}</span>
                          </div>
                        ))}
                      </div>

                      {/* eSign option */}
                      <div style={{ background:PG, borderRadius:8, padding:12, marginBottom:14, display:"flex", alignItems:"center", gap:10, fontSize:13 }}>
                        <span style={{ fontSize:18 }}>✍️</span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:600, marginBottom:2 }}>Require eSignature?</div>
                          <div style={{ fontSize:12, color:TM }}>Recipients will be prompted to sign before the document is finalised</div>
                        </div>
                        <button onClick={()=>notify("eSignature added to job")} style={{ ...bS, fontSize:11, padding:"5px 12px" }}>Add eSign</button>
                      </div>

                      <div style={{ display:"flex", gap:10 }}>
                        <button onClick={async ()=>{ try { await fetch("/api/documents",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({associated_type:searchType,associated_ref:selectedRecord?.ref||null,associated_name:selectedRecord?.name||null,party_name:selectedParty?.name||null,party_role:selectedParty?.role||null,letter_body:aiDraft,compose_mode:composeMode,language:transLang||"en",status:"dispatched"})}); } catch(e) {} notify("Job queued for dispatch"); {setComposeStep(1);setDistChannels([]);setDistSchedule("immediate");setAiDraft("");setAiPrompt("");setAiPurpose("");setAiRecipient("");setComposeMode("template");setSelectedRecord(null);setSearchQuery("");setSelectedParty(null);setClaimPartyStep(false);setTransLang("");setTransOpen(false);setCSearch("");setCCat("All");}} style={{ ...bP, flex:1 }}>
                          Confirm &amp; Dispatch
                        </button>
                        <button onClick={()=>setComposeStep(5)} style={bS}>Back</button>
                      </div>
                    </div>
                  )}
                </Cd>
                <Cd style={{ padding:16 }}>
                  <SL>Merge Fields</SL>
                  {["CUSTOMER_NAME","POLICY_NUMBER","RENEWAL_DATE","PREMIUM_AMOUNT","NCD_YEARS","ADDRESS_LINE1","POSTCODE"].map(f=>(
                    <div key={f} onClick={()=>notify(`Field inserted`)} style={{ padding:"6px 10px", marginBottom:4, borderRadius:5, background:ACL, fontSize:11, color:AC, cursor:"pointer", fontFamily:"monospace", fontWeight:500 }}>{`{{${f}}}`}</div>
                  ))}
                </Cd>
              </div>
            </div>
          )}

          {/* ═══ DISTRIBUTE ═══ */}
          {nav==="distribute" && (
            <div>
              <PH title="Distribution" sub="Configure delivery channels for outbound communications" />
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
                {CHANNELS.map(ch => {
                  const sel = channels.includes(ch.id);
                  return (
                    <Cd key={ch.id} style={{ padding:18, cursor:"pointer", border:`1.5px solid ${sel?AC:BD}`, background:sel?ACL:"#fff", transition:"all 0.15s" }}
                      onClick={()=>setChannels(p=>p.includes(ch.id)?p.filter(c=>c!==ch.id):[...p,ch.id])}>
                      <div style={{ fontSize:24, marginBottom:8 }}><Icon v={ch.icon} size={24} /></div>
                      <div style={{ fontWeight:600, fontSize:13 }}>{ch.label}</div>
                      {sel && <div style={{ fontSize:11, color:AC, marginTop:4, fontWeight:600 }}>✓ Selected</div>}
                    </Cd>
                  );
                })}
              </div>
              <button onClick={()=>notify(`Dispatched via ${channels.length} channel(s)`)} style={{ ...bP, opacity:channels.length?1:0.5 }} disabled={!channels.length}>
                Dispatch via {channels.length} Channel{channels.length!==1?"s":""}
              </button>
            </div>
          )}

          {/* ═══ BULK ═══ */}
          {nav==="bulk" && (
            <div>
              <PH title="Bulk Generation" sub="Mass-produce personalised documents at scale" />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:16 }}>
                <Cd style={{ padding:20 }}>
                  <SL>Job Configuration</SL>
                  <div style={{ display:"grid", gap:10, marginBottom:16 }}>
                    {[["Template","Policy Renewal Notice v3.2"],["PAS Extract","Motor — Renewing in 60 days"],["Output Format","PDF + Email"],["Volume","4,200 records"]].map(([l,v])=>(
                      <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:`1px solid ${BD}`, fontSize:13 }}>
                        <span style={{ color:TS }}>{l}</span><span style={{ fontWeight:500 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  {bulkRun && (
                    <div style={{ marginBottom:16 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:6 }}><span>Progress</span><span style={{ fontWeight:600 }}>{bulkPct}%</span></div>
                      <div style={{ height:8, background:BD, borderRadius:4, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${bulkPct}%`, background:AC, borderRadius:4, transition:"width 0.3s" }}/>
                      </div>
                    </div>
                  )}
                  <div style={{ display:"flex", gap:10 }}>
                    <button style={bP} onClick={()=>{
                      if(bulkRun) return;
                      setBulkRun(true); setBulkPct(0);
                      const iv = setInterval(()=>setBulkPct(p=>{ if(p>=100){clearInterval(iv);setBulkRun(false);notify("Bulk job complete — 4,200 documents dispatched");return 100;} return p+5; }),200);
                    }} disabled={bulkRun}>{bulkRun?"Processing…":"▶ Start Job"}</button>
                    <button style={bS} onClick={()=>{setBulkPct(0);setBulkRun(false);}}>Reset</button>
                  </div>
                </Cd>
                <Cd style={{ padding:20 }}>
                  <SL>Quality Controls</SL>
                  {["Data validation passed","Merge field check","Duplicate detection","Output preview (50 docs)","Compliance check"].map((c,i)=>(
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:i<4?`1px solid ${BD}`:"none", fontSize:13 }}>
                      <span style={{ color:GR }}>✓</span><span style={{ color:TS }}>{c}</span>
                    </div>
                  ))}
                </Cd>
              </div>
            </div>
          )}

          {/* ═══ ESIGN ═══ */}
          {nav==="esign" && (
            <div>
              <PH title="eSignature" sub="Built-in signing workflows" />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:16 }}>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {[
                    { name:"Sarah Thompson", doc:"Motor Policy Schedule",       status:"Awaiting", sent:"Today 08:22" },
                    { name:"Robert Hughes",  doc:"Claim Settlement Agreement",  status:"Signed",   sent:"Yesterday"  },
                    { name:"Lisa Chen",      doc:"MTA Confirmation",            status:"Signed",   sent:"2 days ago" },
                    { name:"Mark Davis",     doc:"Welcome Pack",                status:"Expired",  sent:"8 days ago" },
                  ].map((item,i)=>(
                    <Cd key={i} style={{ padding:"14px 18px", display:"flex", alignItems:"center", gap:14 }}>
                      <div style={{ width:36, height:36, borderRadius:"50%", background:item.status==="Signed"?GL:item.status==="Awaiting"?AL:BD, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>
                        {item.status==="Signed"?"✅":item.status==="Awaiting"?"⏳":"❌"}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:600 }}>{item.name}</div>
                        <div style={{ fontSize:12, color:TM }}>{item.doc} · {item.sent}</div>
                      </div>
                      <Bdg label={item.status} color={item.status==="Signed"?GR:item.status==="Awaiting"?AM:TM} light={item.status==="Signed"?GL:item.status==="Awaiting"?AL:BD} />
                      {item.status==="Awaiting" && <button onClick={()=>notify(`Reminder sent to ${item.name}`)} style={{ ...bS, fontSize:11, padding:"4px 10px" }}>Remind</button>}
                    </Cd>
                  ))}
                </div>
                <Cd style={{ padding:20 }}>
                  <SL>Send for Signature</SL>
                  <input placeholder="Signatory name…" style={{ ...iS, marginBottom:10 }} />
                  <input placeholder="Email address…" style={{ ...iS, marginBottom:10 }} />
                  <select style={{ ...iS, marginBottom:10 }}><option>Select template…</option>{TEMPLATES.map(t=><option key={t.id}>{t.name}</option>)}</select>
                  <button onClick={()=>notify("eSign request sent")} style={{ ...bP, width:"100%" }}>Send for Signature</button>
                </Cd>
              </div>
            </div>
          )}

          {/* ═══ WORKFLOW ═══ */}
          {nav==="workflow" && (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <PH title="Workflow & Automation" sub="Conditional rules, scheduling and approvals" nomb />
                <button onClick={()=>notify("Workflow builder opened")} style={bP}>+ New Workflow</button>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {WORKFLOWS.map((wf,i)=>(
                  <Cd key={i} style={{ padding:"14px 20px", display:"flex", alignItems:"center", gap:16 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600, marginBottom:4 }}>{wf.name}</div>
                      <div style={{ fontSize:12, color:TM }}>Trigger: {wf.trigger} · {wf.steps} steps · {wf.vol}</div>
                    </div>
                    <div style={{ fontSize:12, color:TM }}>{wf.lastRun}</div>
                    <Bdg label={wf.status} color={wf.status==="Active"?GR:AM} light={wf.status==="Active"?GL:AL} />
                    <button onClick={()=>notify(`${wf.name} toggled`)} style={{ ...bS, fontSize:11, padding:"5px 12px" }}>{wf.status==="Active"?"Pause":"Activate"}</button>
                  </Cd>
                ))}
              </div>
            </div>
          )}

          {/* ═══ INTEGRATIONS ═══ */}
          {nav==="integrations" && (
            <div>
              <PH title="Integrations" sub="Native connectors, APIs and automation platforms" />
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
                {INTGS.map((intg,i)=>(
                  <Cd key={i} style={{ padding:18 }}>
                    <div style={{ fontSize:28, marginBottom:10 }}>{intg.icon}</div>
                    <div style={{ fontWeight:600, marginBottom:6 }}>{intg.name}</div>
                    <Bdg label={intg.status} color={GR} light={GL} />
                    <div style={{ fontSize:12, color:TM, marginTop:8 }}>Last sync: {intg.sync}</div>
                    {intg.recs!=="—" && <div style={{ fontSize:12, color:TM }}>{intg.recs} records</div>}
                  </Cd>
                ))}
              </div>
            </div>
          )}

          {/* ═══ STORAGE ═══ */}
          {nav==="storage" && (
            <div>
              <PH title="Storage & Archive" sub="Scalable document storage with compliance controls" />
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
                {[{l:"Total Documents",v:"2.4M",c:AC},{l:"Storage Used",v:"1.8 TB",c:GR},{l:"Avg Retrieval",v:"120ms",c:AM},{l:"Retention Policy",v:"7 Years",c:PU}].map((s,i)=>(
                  <Cd key={i} style={{ padding:18, borderTop:`3px solid ${s.c}` }}>
                    <div style={{ fontSize:12, color:TM, marginBottom:6 }}>{s.l}</div>
                    <div style={{ fontSize:24, fontWeight:700 }}>{s.v}</div>
                  </Cd>
                ))}
              </div>
              <Cd style={{ padding:20 }}>
                <SL>Compliance Controls</SL>
                {[["Encryption at rest","AES-256"],["Encryption in transit","TLS 1.3"],["WORM protection","7-year retention"],["GDPR compliance","Certified"],["Audit trail","Immutable log"]].map(([k,v])=>(
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:`1px solid ${BD}`, fontSize:13 }}>
                    <span style={{ color:TS }}>{k}</span><span style={{ color:GR, fontWeight:500 }}>✓ {v}</span>
                  </div>
                ))}
              </Cd>
            </div>
          )}

          {/* ═══ ANALYTICS ═══ */}
          {nav==="analytics" && (
            <div>
              <PH title="Analytics & Reporting" sub="Document usage, delivery performance and engagement" />
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
                {[{t:"Top Template",v:"Welcome Pack – Motor",m:"4,520 uses"},{t:"Avg Open Rate",v:"68.4%",m:"+3.2% vs last month"},{t:"eSign Completion",v:"94.1%",m:"Avg 4.2 hrs to sign"}].map((c,i)=>(
                  <Cd key={i} style={{ padding:20 }}>
                    <div style={{ fontSize:12, color:TM, marginBottom:8 }}>{c.t}</div>
                    <div style={{ fontSize:22, fontWeight:700, marginBottom:4 }}>{c.v}</div>
                    <div style={{ fontSize:12, color:GR, fontWeight:500 }}>{c.m}</div>
                  </Cd>
                ))}
              </div>
              <Cd style={{ overflow:"hidden" }}>
                <div style={{ padding:"14px 20px", borderBottom:`1px solid ${BD}`, fontSize:13, fontWeight:600 }}>Template Performance — March 2026</div>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                  <thead><tr style={{ background:PG }}>{["Template","Generated","Delivered","Opened","Errors"].map(h=><th key={h} style={{ padding:"10px 20px", textAlign:"left", fontSize:11, fontWeight:600, color:TM, borderBottom:`1px solid ${BD}` }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {[["Policy Renewal Notice","38,400","38,312","26,100 (68%)","88"],["Welcome Pack – Motor","12,600","12,600","9,800 (78%)","0"],["Claims Acknowledgement","5,240","5,198","4,100 (79%)","42"]].map((row,i)=>(
                      <tr key={i} style={{ borderBottom:`1px solid ${BD}` }}>
                        {row.map((cell,j)=><td key={j} style={{ padding:"12px 20px", color:j===0?TP:j===4?(parseInt(cell)>0?RD:GR):TS, fontWeight:j===0?500:400 }}>{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Cd>
            </div>
          )}

          {/* ═══ SECURITY ═══ */}
          {nav==="security" && (
            <div>
              <PH title="Security & Compliance" sub="Encryption, access controls and audit trails" />
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
                {[{l:"Security Score",v:"98/100",c:GR},{l:"Failed Logins Today",v:"3",c:AM},{l:"Audit Events Today",v:"14,820",c:AC}].map((s,i)=>(
                  <Cd key={i} style={{ padding:20, borderTop:`3px solid ${s.c}` }}>
                    <div style={{ fontSize:12, color:TM, marginBottom:6 }}>{s.l}</div>
                    <div style={{ fontSize:26, fontWeight:700, color:s.c }}>{s.v}</div>
                  </Cd>
                ))}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <Cd style={{ padding:20 }}>
                  <SL>Security Controls</SL>
                  {[["MFA Enforcement","All users"],["SSO / SAML","Active — Azure AD"],["Role-based Access","12 roles"],["IP Allowlist","3 ranges"],["Session timeout","30 minutes"]].map(([k,v])=>(
                    <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:`1px solid ${BD}`, fontSize:13 }}>
                      <span style={{ color:TS }}>{k}</span><span style={{ color:GR, fontWeight:500 }}>✓ {v}</span>
                    </div>
                  ))}
                </Cd>
                <Cd style={{ padding:20 }}>
                  <SL>Recent Audit Log</SL>
                  {[
                    { time:"09:41", event:"Template published",    user:"s.kent",   level:"info"  },
                    { time:"09:38", event:"Bulk job initiated",    user:"system",   level:"info"  },
                    { time:"09:22", event:"User role modified",    user:"admin",    level:"warn"  },
                    { time:"08:30", event:"Failed login attempt",  user:"unknown",  level:"error" },
                  ].map((log,i,arr)=>(
                    <div key={i} style={{ display:"flex", gap:10, padding:"8px 0", borderBottom:i<arr.length-1?`1px solid ${BD}`:"none", fontSize:12, alignItems:"center" }}>
                      <span style={{ color:TM, width:36, flexShrink:0 }}>{log.time}</span>
                      <span style={{ width:7, height:7, borderRadius:"50%", flexShrink:0, background:log.level==="error"?RD:log.level==="warn"?AM:BD }}/>
                      <span style={{ flex:1 }}>{log.event}</span>
                      <span style={{ color:TM }}>{log.user}</span>
                    </div>
                  ))}
                </Cd>
              </div>
            </div>
          )}

          {/* ═══ USER ADMIN ═══ */}
          {nav==="useradmin" && (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <PH title="User Administration" sub="Manage users, roles and feature-level permissions" nomb />
                <button onClick={()=>setShowCreate(true)} style={bP}>+ Create User</button>
              </div>

              {/* Stats */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
                {[
                  { l:"Total Users",  v:users.length,                                  c:AC },
                  { l:"Active",       v:users.filter(u=>u.status==="Active").length,   c:GR },
                  { l:"MFA Enabled",  v:users.filter(u=>u.mfa).length,                c:PU },
                  { l:"Inactive",     v:users.filter(u=>u.status==="Inactive").length, c:AM },
                ].map((s,i)=>(
                  <Cd key={i} style={{ padding:18, borderTop:`3px solid ${s.c}` }}>
                    <div style={{ fontSize:12, color:TM, marginBottom:6 }}>{s.l}</div>
                    <div style={{ fontSize:28, fontWeight:700 }}>{s.v}</div>
                  </Cd>
                ))}
              </div>

              {/* Tabs */}
              <div style={{ display:"flex", borderBottom:`1px solid ${BD}`, marginBottom:16 }}>
                {[["users","👥 Users"],["roles","🎭 Roles"],["perms","🔐 Permissions"]].map(([t,l])=>(
                  <button key={t} onClick={()=>setUTab(t)} style={{ padding:"10px 20px", border:"none", background:"transparent", fontFamily:F, fontSize:13, cursor:"pointer", fontWeight:uTab===t?600:400, color:uTab===t?AC:TS, borderBottom:uTab===t?`2px solid ${AC}`:"2px solid transparent", marginBottom:-1 }}>{l}</button>
                ))}
              </div>

              {/* Users tab */}
              {uTab==="users" && (
                <div>
                  <Cd style={{ padding:"12px 16px", marginBottom:14, display:"flex", gap:10 }}>
                    <input placeholder="Search by name or email…" value={uSearch} onChange={e=>setUSearch(e.target.value)} style={{ flex:1, ...iS }} />
                    <select style={{ ...iS, width:"auto" }}><option>All Roles</option>{ROLES.map(r=><option key={r.id}>{r.label}</option>)}</select>
                  </Cd>
                  <Cd style={{ overflow:"hidden" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                      <thead>
                        <tr style={{ background:PG }}>
                          {["User","Email","Role","Dept","Status","MFA","Last Login","Actions"].map(h=>(
                            <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:11, fontWeight:600, color:TM, borderBottom:`1px solid ${BD}`, whiteSpace:"nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {users.filter(u=>u.name.toLowerCase().includes(uSearch.toLowerCase())||u.email.toLowerCase().includes(uSearch.toLowerCase())).map(u=>{
                          const role = ROLES.find(r=>r.id===u.role);
                          const initials = u.name.split(" ").map(w=>w[0]).join("").slice(0,2);
                          return (
                            <tr key={u.id} style={{ borderBottom:`1px solid ${BD}`, background:selUser?.id===u.id?ACL:"#fff" }}>
                              <td style={{ padding:"12px 16px" }}>
                                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                                  <div style={{ width:30, height:30, borderRadius:"50%", background:`${role?.color||AC}22`, border:`1.5px solid ${role?.color||AC}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:role?.color||AC, flexShrink:0 }}>{initials}</div>
                                  <span style={{ fontWeight:500 }}>{u.name}</span>
                                </div>
                              </td>
                              <td style={{ padding:"12px 16px", color:TS }}>{u.email}</td>
                              <td style={{ padding:"12px 16px" }}><Bdg label={role?.label||u.role} color={role?.color||AC} light={role?.light||ACL} /></td>
                              <td style={{ padding:"12px 16px", color:TS }}>{u.dept}</td>
                              <td style={{ padding:"12px 16px" }}><Bdg label={u.status} color={u.status==="Active"?GR:AM} light={u.status==="Active"?GL:AL} /></td>
                              <td style={{ padding:"12px 16px", fontSize:15 }}>{u.mfa?"✅":"⚠️"}</td>
                              <td style={{ padding:"12px 16px", color:TM, fontSize:12 }}>{u.lastLogin}</td>
                              <td style={{ padding:"12px 16px" }}>
                                <div style={{ display:"flex", gap:6 }}>
                                  <button onClick={()=>setSelUser(selUser?.id===u.id?null:u)} style={{ ...bS, fontSize:11, padding:"4px 10px" }}>Edit</button>
                                  <button onClick={()=>{setUsers(p=>p.map(x=>x.id===u.id?{...x,status:x.status==="Active"?"Inactive":"Active"}:x));notify(`${u.name} ${u.status==="Active"?"deactivated":"activated"}`);}}
                                    style={{ ...bS, fontSize:11, padding:"4px 10px", color:u.status==="Active"?AM:GR, borderColor:u.status==="Active"?`${AM}80`:`${GR}80` }}>
                                    {u.status==="Active"?"Deactivate":"Activate"}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </Cd>

                  {selUser && (
                    <Cd style={{ marginTop:14, padding:20, border:`1px solid ${AC}` }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
                        <div style={{ fontSize:14, fontWeight:700 }}>Edit — {selUser.name}</div>
                        <button onClick={()=>setSelUser(null)} style={{ ...bS, fontSize:11, padding:"4px 10px" }}>Close</button>
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:14 }}>
                        {[["Name","name"],["Email","email"],["Dept","dept"]].map(([label,field])=>(
                          <div key={field}>
                            <div style={{ fontSize:11, color:TM, marginBottom:5 }}>{label}</div>
                            <input defaultValue={selUser[field]} style={iS} onBlur={e=>setUsers(p=>p.map(u=>u.id===selUser.id?{...u,[field]:e.target.value}:u))} />
                          </div>
                        ))}
                        <div>
                          <div style={{ fontSize:11, color:TM, marginBottom:5 }}>Role</div>
                          <select defaultValue={selUser.role} style={iS} onChange={e=>setUsers(p=>p.map(u=>u.id===selUser.id?{...u,role:e.target.value}:u))}>
                            {ROLES.map(r=><option key={r.id} value={r.id}>{r.label}</option>)}
                          </select>
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                        <button onClick={()=>{notify(`${selUser.name} saved`);setSelUser(null);}} style={bP}>Save Changes</button>
                        <button onClick={()=>{setUsers(p=>p.filter(u=>u.id!==selUser.id));setSelUser(null);notify("User removed");}} style={{ ...bS, color:RD, borderColor:`${RD}60` }}>Remove User</button>
                      </div>
                    </Cd>
                  )}
                </div>
              )}

              {/* Roles tab */}
              {uTab==="roles" && (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
                  {ROLES.map(role=>{
                    const ru = users.filter(u=>u.role===role.id);
                    return (
                      <Cd key={role.id} style={{ padding:20, borderTop:`3px solid ${role.color}` }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                          <div style={{ fontSize:14, fontWeight:700 }}>{role.label}</div>
                          <span style={{ fontSize:11, padding:"2px 8px", borderRadius:20, background:role.light, color:role.color, fontWeight:600 }}>{ru.length} user{ru.length!==1?"s":""}</span>
                        </div>
                        <div style={{ fontSize:12, color:TS, marginBottom:14, lineHeight:1.5 }}>{role.desc}</div>
                        {ru.length>0 && (
                          <div style={{ display:"flex", marginBottom:14 }}>
                            {ru.slice(0,5).map((u,i)=>(
                              <div key={u.id} style={{ width:26, height:26, borderRadius:"50%", background:`${role.color}44`, border:"2px solid #fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, color:role.color, marginLeft:i>0?-8:0 }}>
                                {u.name.split(" ").map(w=>w[0]).join("").slice(0,2)}
                              </div>
                            ))}
                          </div>
                        )}
                        <button onClick={()=>notify(`Editing: ${role.label}`)} style={{ ...bS, fontSize:11, padding:"5px 12px", width:"100%" }}>Edit Permissions</button>
                      </Cd>
                    );
                  })}
                </div>
              )}

              {/* Permissions tab */}
              {uTab==="perms" && (
                <Cd style={{ overflow:"auto" }}>
                  <div style={{ padding:"14px 20px", borderBottom:`1px solid ${BD}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ fontSize:13, fontWeight:600 }}>Feature Permission Matrix</div>
                    <div style={{ display:"flex", gap:14, fontSize:11 }}>
                      {[["Full",GR],["Edit",AC],["View",AM],["None",TM]].map(([l,c])=>(
                        <span key={l} style={{ display:"flex", alignItems:"center", gap:4, color:c }}><span style={{ width:8, height:8, borderRadius:2, background:c, display:"inline-block" }}/>{l}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                      <thead>
                        <tr style={{ background:PG }}>
                          <th style={{ padding:"10px 20px", textAlign:"left", fontWeight:600, color:TM, borderBottom:`1px solid ${BD}`, minWidth:160 }}>Feature</th>
                          {ROLES.map(r=>(
                            <th key={r.id} style={{ padding:"10px 12px", textAlign:"center", borderBottom:`1px solid ${BD}`, minWidth:100 }}>
                              <span style={{ fontSize:11, padding:"3px 8px", borderRadius:20, background:r.light, color:r.color, fontWeight:600, display:"inline-block" }}>{r.label}</span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {PMATRIX.map((row,i)=>(
                          <tr key={i} style={{ borderBottom:`1px solid ${BD}`, background:i%2===0?"#fff":PG }}>
                            <td style={{ padding:"10px 20px", fontWeight:500 }}>{row.f}</td>
                            {ROLES.map(r=>{
                              const cfg = permColor(row[r.id]);
                              return (
                                <td key={r.id} style={{ padding:"10px 12px", textAlign:"center" }}>
                                  <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, background:cfg.bg, color:cfg.color }}>{cfg.lbl}</span>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Cd>
              )}
            </div>
          )}

        </main>
      </div>

      {/* Create User Modal */}
      {showCreate && (
        <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center" }}
          onClick={e=>{ if(e.target===e.currentTarget) setShowCreate(false); }}>
          <div style={{ background:"#fff", borderRadius:14, width:540, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ padding:"20px 24px 16px", borderBottom:`1px solid ${BD}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:16, fontWeight:700 }}>Create New User</div>
                <div style={{ fontSize:12, color:TM, marginTop:2 }}>Set up account access and assign a role</div>
              </div>
              <button onClick={()=>setShowCreate(false)} style={{ width:28, height:28, borderRadius:"50%", border:`1px solid ${BD}`, background:"#fff", cursor:"pointer", fontSize:16, color:TS, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
            </div>
            <div style={{ padding:"20px 24px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                {[["Full Name","name","text","e.g. Jane Smith"],["Email","email","email","jane@rdtltd.com"],["Department","dept","text","e.g. Operations"],["Job Title","jobtitle","text","e.g. Underwriter"]].map(([label,field,type,ph])=>(
                  <div key={field}>
                    <label style={{ fontSize:12, fontWeight:600, color:TS, display:"block", marginBottom:5 }}>{label}</label>
                    <input type={type} placeholder={ph} value={newU[field]||""} onChange={e=>setNewU(p=>({...p,[field]:e.target.value}))} style={iS} />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:12, fontWeight:600, color:TS, display:"block", marginBottom:8 }}>Assign Role</label>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {ROLES.map(role=>(
                    <div key={role.id} onClick={()=>setNewU(p=>({...p,role:role.id}))}
                      style={{ padding:"10px 14px", borderRadius:8, cursor:"pointer", border:`1.5px solid ${newU.role===role.id?role.color:BD}`, background:newU.role===role.id?role.light:"#fff", transition:"all 0.15s" }}>
                      <div style={{ display:"flex", justifyContent:"space-between" }}>
                        <span style={{ fontSize:12, fontWeight:600, color:newU.role===role.id?role.color:TP }}>{role.label}</span>
                        {newU.role===role.id && <span style={{ color:role.color, fontSize:12 }}>✓</span>}
                      </div>
                      <div style={{ fontSize:11, color:TM, marginTop:2 }}>{role.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background:PG, borderRadius:8, padding:12, marginBottom:16 }}>
                <label style={{ display:"flex", alignItems:"center", gap:10, fontSize:13, color:TS, cursor:"pointer" }}>
                  <div onClick={()=>setNewU(p=>({...p,mfa:!p.mfa}))}
                    style={{ width:16, height:16, borderRadius:4, background:newU.mfa?AC:"#fff", border:`1.5px solid ${newU.mfa?AC:BD}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"#fff", flexShrink:0 }}>
                    {newU.mfa?"✓":""}
                  </div>
                  Require MFA on first login
                </label>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button style={{ ...bP, flex:1 }} onClick={()=>{
                  if(!newU.name||!newU.email){ notify("Name and email are required","error"); return; }
                  setUsers(p=>[...p,{ id:Date.now(), name:newU.name, email:newU.email, role:newU.role, dept:newU.dept||"—", status:"Active", lastLogin:"Never", mfa:newU.mfa }]);
                  setShowCreate(false);
                  setNewU({ name:"", email:"", role:"doc_viewer", dept:"", mfa:false });
                  notify(`User ${newU.name} created`);
                }}>Create User &amp; Send Invite</button>
                <button onClick={()=>setShowCreate(false)} style={bS}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:5px; } ::-webkit-scrollbar-thumb { background:${BD}; border-radius:3px; }
        button:hover { opacity:0.88; }
        input:focus, select:focus { outline:2px solid ${AC}40 !important; border-color:${AC} !important; }
      `}</style>
    </div>
  );
}
