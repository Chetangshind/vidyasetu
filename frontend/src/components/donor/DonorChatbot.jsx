import { useState, useRef } from "react";
import "./DonorChatbot.css";
import { useNavigate } from "react-router-dom";
import API from "../../api";

export default function DonorChatbot() {

  const [open,setOpen] = useState(false)
  const messagesEndRef = useRef(null)
  const navigate = useNavigate();

 const questions = [
  {
    q:"How do I create my scheme?",
    a:"Go to the Create My Scheme tab in the sidebar. There you can fill in the scheme details and create your scheme."
  },
  {
    q:"Where can I see all my schemes?",
    a:"Go to the My Schemes page in the sidebar. There you can view all your Active, Draft, and Closed schemes."
  },
  {
    q:"Where can I see meeting schedules with students?",
    a:"Go to Applications → Approved section. There you can see all scheduled meetings with students along with date, time and meeting details."
  },
  {
    q:"Can I contact the student directly?",
    a:"Communication can happen through scheduled meetings on the platform. Student contact details may also be available on the student profile."
  },
  {
    q:"Can I donate to multiple students?",
    a:"Yes. You can support multiple students depending on your preference and donation capacity."
  },
  {
      q:"How can I contact support?",
      a:"Go to the Help & Support section in the donor dashboard to contact admin."
    },
  {
    q:"I have another issue / Talk to support",
    a:"If your issue is not resolved here, you can raise a query to our support team."
  }
];

  const [messages,setMessages] = useState([
    {sender:"bot",type:"questions"}
  ])

const handleQuestionClick = (q,a)=>{

if(q === "I have another issue / Talk to support"){
  setOpen(false)
  navigate("/donor/help-support")
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

      <div className="Veda-wrapper">
        <div className="Veda-bot" onClick={()=>setOpen(!open)}>
          <img src="/robo.png"/>
        </div>
      </div>

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
      How can I assist you with donations today?
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