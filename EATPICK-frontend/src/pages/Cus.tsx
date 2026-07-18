import { useState } from "react";
import "../assets/css/Cus.css";

// ─── 데이터 인터페이스 정의 ──────────────────────────────────────
interface InquiryForm {
  category: string;
  name: string;
  email: string;
  subject: string;
  message: string;
}

// 환경변수 주소 설정 (VITE 배포 환경 대응)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export default function CustomerService() {
  // ─── 상태 관리 ───
  const [formData, setFormData] = useState<InquiryForm>({
    category: "",
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [openFaq, setOpenFaq] = useState<{ [key: number]: boolean }>({});

  // ─── 입력 핸들러 ───
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ─── FAQ 토글 핸들러 ───
  const handleToggleFaq = (index: number) => {
    setOpenFaq((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // ─── 1:1 문의 서버 전송 핸들러 (연동 기능 추가) ───────────────────
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 

    const { category, name, email, subject, message } = formData;

    // 프론트엔드 1차 유효성 검사
    if (category === "") {
      alert("문의 유형을 선택해 주세요.");
      return;
    }
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      alert("모든 필수 입력 필드를 채워주세요.");
      return;
    }

    try {
      // 실제 관리자 데이터베이스로 전송하는 비동기 통신 로직 결합
      const response = await fetch(`${BASE_URL}/api/support/inquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // 입력한 카테고리, 이름, 이메일, 제목, 내용 전송
      });

      if (response.ok) {
        // 서버 측에서 저장이 완료되었을 때 알림 출력
        alert("접수완료되었습니다. 기재해주신 이메일로 빠르게 답변드리겠습니다.");
        
        // 입력 폼 완벽 초기화
        setFormData({
          category: "",
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        alert("고객센터 서버 통신에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }
    } catch (error) {
      console.error("고객센터 전송 에러:", error);
      alert("네트워크 연결 오류가 발생했습니다.");
    }
  };

  return (
    <>
      <header className="cs-header">
        <div className="header-content">
          <h2 className="logo"><br />
            <span>Eat Pick</span> 고객센터
          </h2><br /><br />
          <div className="welcome-box">
            <h3>안녕하세요, 어떤 도움이 필요하신가요?</h3>
            <p>Eat Pick 서비스 이용 중 불편한 점이나 제안하고 싶은 내용을 자유롭게 남겨주세요.</p>
          </div><br />
        </div>
      </header>

      <section className="quick-menu-container">
        <a href="#faq-item01" className="quick-card">
          <h4>자주하는 질문 (FAQ)</h4>
          <p>회원님들이 가장 많이 찾는 질문을 모았습니다.</p>
        </a>
        <a
          href="#inquiryAnchor"
          className="quick-card"
          onClick={() => {
            const subjectInput = document.getElementById("subject");
            if (subjectInput) subjectInput.focus();
          }}
        >
          <h4>1:1 이메일 문의</h4>
          <p>24시간 접수 가능하며 순차적으로 답변드립니다.</p>
        </a>
        <a href="tel:1588-0000"  className="quick-card">
          <h4>긴급 상담원 연결</h4>
          <p>운영 시간 내 유선 통화 연결이 가능합니다.</p>
        </a>
      </section>

      <div className="main-layout-wrapper">
        <div className="left-column">
          <div className="con-card">
            <div className="card-top">Eat Pick 고객센터 안내</div>
            <div className="info-details">
              <h4>전화번호</h4>
              <div className="phone-number">1588 - 0000</div>
              <h4>운영시간</h4>
              <p>평일: 09:30 ~ 18:30</p>
              <p style={{ color: "#999", fontSize: "12px" }}>(점심시간 12:30 ~ 13:30)</p>
              <p style={{ marginTop: "5px", fontWeight: 500 }}>토, 일, 공휴일 휴무</p>
            </div>
            <a href="tel:1588-0000" className="btn-call">
              상담원 전화 연결하기
            </a>
          </div>

          <div className="con-card" id="faq-item01">
            <div className="card-top">자주하는 질문 (FAQ)</div>

            <div className="faq-item">
              <div
                className="faq-trigger"
                onClick={() => handleToggleFaq(0)}
                style={{ color: openFaq[0] ? "var(--primary-red)" : "var(--text-main)" }}
              >
                당일 예약 취소 및 환불 기준이 어떻게 되나요? <span>{openFaq[0] ? "▲" : "▼"}</span>
              </div>
              {openFaq[0] && (
                <div className="faq-content" style={{ display: "block" }}>
                  방문 3시간 전까지 취소 시 100% 환불이 가능하며, 이후 취소 시 매장 정책에 따라 노쇼 위약금이 발생할 수 있습니다.
                </div>
              )}
            </div>

            <div className="faq-item">
              <div
                className="faq-trigger"
                onClick={() => handleToggleFaq(1)}
                style={{ color: openFaq[1] ? "var(--primary-red)" : "var(--text-main)" }}
              >
                서비스 오류 제보는 어디로 하나요? <span>{openFaq[1] ? "▲" : "▼"}</span>
              </div>
              {openFaq[1] && (
                <div className="faq-content" style={{ display: "block" }}>
                  우측 1:1 문의 양식에서 '서비스 오류 제보' 유형을 선택해 화면 캡처 링크와 함께 보내주시면 즉시 수정 조치하겠습니다.
                </div>
              )}
            </div>

            <div className="faq-item">
              <div
                className="faq-trigger"
                onClick={() => handleToggleFaq(2)}
                style={{ color: openFaq[2] ? "var(--primary-red)" : "var(--text-main)" }}
              >
                회원 탈퇴 및 데이터 삭제 방법 <span>{openFaq[2] ? "▲" : "▼"}</span>
              </div>
              {openFaq[2] && (
                <div className="faq-content" style={{ display: "block" }}>
                  마이페이지 ➔ 회원정보 수정 최하단 [회원 탈퇴] 버튼을 통해 즉시 처리가 가능하며, 결제 내역은 법정 보존 기한 후 파기됩니다.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="con-card" id="inquiryAnchor">
          <div className="card-top">Eat Pick 1:1 문의하기</div>
          <form id="csForm" onSubmit={handleFormSubmit}>
            
            <div className="form-group">
              <label htmlFor="category">문의 유형</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">유형을 선택해주세요</option>
                <option value="일반문의">일반문의</option>
                <option value="예약/방문">예약 및 방문 문의</option>
                <option value="오류제보">서비스 오류 제보</option>
                <option value="기타">기타</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="name">이름</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="성함을 입력해주세요"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">이메일 주소</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="답변받으실 이메일을 입력해주세요"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">문의 제목</label>
              <input
                type="text"
                id="subject"
                name="subject"
                placeholder="제목을 입력해주세요"
                value={formData.subject}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">문의 내용</label>
              <textarea
                id="message"
                name="message"
                placeholder="불편하신 점이나 제안 사항을 상세히 기술해 주시면 보다 빠른 답변이 가능합니다."
                value={formData.message}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>

            <button type="submit" className="online-btn">
              온라인 문의 제출하기
            </button>
          </form>
        </div>
      </div>
    </>
  );
}