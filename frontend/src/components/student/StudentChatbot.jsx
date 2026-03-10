import { useState, useRef, useEffect } from "react";
import "./StudentChatbot.css";
import { useNavigate } from "react-router-dom";
import API from "../../api";

export default function StudentChatbot() {

  const [open,setOpen] = useState(false)
  const messagesEndRef = useRef(null)
  const navigate = useNavigate();
  const botRef = useRef(null)

  const [position,setPosition] = useState({
    x: window.innerWidth - 120,
    y: window.innerHeight - 120
  })

  const dragging = useRef(false)
  const offset = useRef({x:0,y:0})

 const handleMouseDown = (e)=>{
  e.preventDefault()
  dragging.current = true
    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    }
  }
const handleTouchStart = (e)=>{
  const touch = e.touches[0]

  dragging.current = true
  offset.current = {
    x: touch.clientX - position.x,
    y: touch.clientY - position.y
  }
}

const handleTouchMove = (e)=>{
  if(!dragging.current) return

  const touch = e.touches[0]

  setPosition({
    x: touch.clientX - offset.current.x,
    y: touch.clientY - offset.current.y
  })
}

const handleTouchEnd = ()=>{
  dragging.current=false
}
  const handleMouseMove = (e)=>{
    if(!dragging.current) return

    setPosition({
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y
    })
  }

  const handleMouseUp = ()=>{
    dragging.current=false
  }

  useEffect(()=>{

  window.addEventListener("mousemove",handleMouseMove)
  window.addEventListener("mouseup",handleMouseUp)

  window.addEventListener("touchmove",handleTouchMove)
  window.addEventListener("touchend",handleTouchEnd)

  return ()=>{
    window.removeEventListener("mousemove",handleMouseMove)
    window.removeEventListener("mouseup",handleMouseUp)

    window.removeEventListener("touchmove",handleTouchMove)
    window.removeEventListener("touchend",handleTouchEnd)
  }

},[])
 

  const questions = [
    {
      q:"How do I apply for a scheme?",
      a:"Go to the All Available Schemes page → Select the scheme → Click Apply → Review your profile form → Submit the application."
    },
    {
      q:"How can I track my application?",
      a:"Go to the My Applied Schemes page → You can see the status of your applications such as Under Scrutiny, Approved or Rejected."
    },
    {
      q:"I can't see my application under My Applied Schemes",
      a:"Refresh the My Applied Schemes page. If it still doesn't appear, check the Scheme History page."
    },
    {
      q:"Where can I see my scheme history?",
      a:"Go to the Scheme History page → Select appropriate application year → You will see history of all Approved, Rejected or Under Scrutiny applications."
    },
    {
      q:"How do I make Aadhaar or other documents?",
      a:"Go to the Guidelines page → Select the document → Watch the YouTube tutorial or open the PDF guide."
    },
    {
      q:"Where can I see meetings scheduled for my application?",
      a:"Go to My Applied Schemes → Open the Meetings tab."
    },
    {
      q:"Why was my application rejected?",
      a:"Applications may be rejected due to incorrect documents, incomplete information or not meeting eligibility criteria."
    },
    {
      q:"What does 'Under Scrutiny' mean?",
      a:"Under Scrutiny means your application is currently being verified by authorities."
    },
    {
      q:"Where can I see approved schemes?",
      a:"Go to the Scheme History tab → Select the year → Open the Approved section."
    },
    {
      q:"How can I contact support?",
      a:"Go to the Help or Support section in the dashboard to contact admin."
    },
    {
      q:"I have another issue / Talk to support",
      a:"If your issue is not resolved here, you can raise a query to our support team."
    }
  ]

  const [messages,setMessages] = useState([
    {sender:"bot",type:"questions"}
  ])

const handleQuestionClick = (q,a)=>{

if(q === "I have another issue / Talk to support"){
  setOpen(false)
  navigate("/student/help-support")
  return
}

  setMessages(prev=>[
    ...prev,
    {sender:"user",text:q},
    {sender:"bot",text:a}
  ])

  setTimeout(()=>{
    messagesEndRef.current?.scrollIntoView({behavior:"smooth"})
  },100)

  setTimeout(()=>{
    setMessages(prev=>[
      ...prev,
      {sender:"bot",type:"questions"}
    ])
  },500)

}

  return(
    <>

      {/* BOT ICON */}
 <div
  ref={botRef}
  className="Veda-wrapper"
  onMouseDown={handleMouseDown}
  onTouchStart={handleTouchStart}
style={{
  left: position.x,
  top: position.y,
  position:"fixed",
  zIndex:9999,
  cursor:"grab",
  userSelect:"none"
}}
>
       <div
  className="Veda-bot"
  onClick={()=>setOpen(!open)}
>
          <img src="/robo.png"/>
        </div>
      </div>


      {/* CHAT WINDOW */}
      {open &&(

        <div className="Veda-chat">

          <div className="Veda-header">
            💙 Veda Assistant
            <span onClick={()=>setOpen(false)}>✖</span>
          </div>


          <div className="Veda-messages">

            {messages.map((msg,index)=>{

              if(msg.type==="questions"){
                return(

                  <div key={index} className="Veda-message bot">

                   <div className="Veda-title">
  {index === 0 ? (
    <>
      Hi 👋 I'm Veda
      <br />
      How can I help you today?
    </>
  ) : (
    <>
      Do you need help with anything else?
    </>
  )}
</div>

                    <div className="Veda-question-list">

                      {questions.map((item,i)=>(
                        <div
  key={i}
  className={item.q.includes("support") ? "Veda-question support" : "Veda-question"}
  onClick={()=>handleQuestionClick(item.q,item.a)}
>
  {item.q}
</div>
                      ))}

                    </div>

                  </div>

                )
              }

              return(
                <div
                  key={index}
                  className={`Veda-message ${msg.sender}`}
                >
                  {msg.text}
                </div>
              )

            })}

            <div ref={messagesEndRef}></div>

          </div>

        </div>

      )}

    </>
  )
}