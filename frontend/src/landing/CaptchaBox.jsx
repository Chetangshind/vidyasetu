import React, { useEffect, useState } from "react";

export default function CaptchaBox({
  captchaText,
  setCaptchaText,
  setCaptchaToken,
}) {
  const [captchaImg, setCaptchaImg] = useState(null);

  const loadCaptcha = async () => {
    const res = await fetch("http://localhost:5050/api/captcha");
    const data = await res.json();

    setCaptchaImg(data.image);
    setCaptchaToken(data.token);
    setCaptchaText("");
  };

  useEffect(() => {
    loadCaptcha();
  }, []);

  return (
    <div className="captcha-box">
<div className="captcha-row">
  <img src={captchaImg} alt="captcha" />
  <span className="captcha-refresh" onClick={loadCaptcha}>
    Refresh
  </span>
</div>

<p className="captcha-hint">Enter the text shown in image</p>

<input
  type="text"
  value={captchaText}
  onChange={(e) => setCaptchaText(e.target.value.toUpperCase())}
  className="auth-input"
/>
    </div>
  );
}
