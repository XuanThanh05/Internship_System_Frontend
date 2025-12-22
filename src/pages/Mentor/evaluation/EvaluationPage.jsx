import { useState, useEffect, useContext } from "react"
import { AuthContext } from "../../../context/AuthContext"
import styles from "./EvaluationPage.module.css"
import Modal from "./Modal"
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ROOT_API } from "../../../api/rootApi";

export default function EvaluationPage({ teamId, display_name, onBack }) {
  const { token, user } = useContext(AuthContext)

  const [teamData, setTeamData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selectedIntern, setSelectedIntern] = useState(null)
  const [editEval, setEditEval] = useState(null)
  const [openAddModal, setOpenAddModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [mentor, setMentor] = useState(null)

  const [newEval, setNewEval] = useState({
    title: "",
    technical: 5,
    communication: 5,
    discipline: 5,
    attitude: 5,
    weight: 50,
    note: "",
  })

  // =============================
  // 🔥 CALL API LẤY DATA TEAM
  // =============================
  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const res = await fetch(`${ROOT_API}/api/mentors/user/${user.userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Không lấy được mentor");
        const data = await res.json();
        setMentor(data);
      } catch (err) {
        toast.error(err.message);
      }
    }
    fetchMentor();
  }, [user.userId, token]);
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch(`${ROOT_API}/api/evaluations/team/${teamId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        })

        if (!res.ok) throw new Error("Không thể tải dữ liệu nhóm")

        const data = await res.json()

        // API trả về dạng mảng [ { team_id, interns: [...] } ]
        const team = Array.isArray(data) ? data[0] : data

        setTeamData(team)
        setSelectedIntern(team.interns[0] || null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTeam()
  }, [teamId, token])

  if (loading) return <p>Đang tải dữ liệu...</p>
  if (error) return <p style={{ color: "red" }}>{error}</p>
  if (!teamData) return <p>Không tìm thấy dữ liệu nhóm</p>

  // =============================
  // ⭐ chuẩn bị danh sách evaluated / not evaluated
  // =============================
  const selectedInternEvals = selectedIntern?.evaluations || []

  const evaluatedInternIds = new Set(
    teamData.interns.filter(i => i.evaluations.length > 0).map(i => i.intern_id)
  )

  const notEvaluatedInterns = teamData.interns.filter(
    intern => !evaluatedInternIds.has(intern.intern_id)
  )

  const evaluatedInterns = teamData.interns.filter(
    intern => evaluatedInternIds.has(intern.intern_id)
  )

  // =============================
  // ⭐ tính trung bình
  // =============================
  const calculateAverages = () => {
    if (selectedInternEvals.length === 0) return null

    const avg = {
      technical: selectedInternEvals.reduce((s, e) => s + e.technical * (e.weight / 100), 0),
      communication: selectedInternEvals.reduce((s, e) => s + e.communication * (e.weight / 100), 0),
      discipline: selectedInternEvals.reduce((s, e) => s + e.discipline * (e.weight / 100), 0),
      attitude: selectedInternEvals.reduce((s, e) => s + e.attitude * (e.weight / 100), 0),
      totalScore: selectedInternEvals.reduce(
        (sum, e) => sum + ((e.technical + e.communication + e.discipline + e.attitude) / 4) * (e.weight / 100),
        0
      ),
    }

    return avg
  }

    const handleAddEvaluation = async () => {
      if (!selectedIntern || !mentor) return;

      try {
        const res = await fetch(`${ROOT_API}/api/evaluations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            internId: selectedIntern.intern_id,  // gửi đúng tên trường
            mentorId: mentor.mentorId,           // gửi mentorId
            title: newEval.title,
            technical: newEval.technical,
            communication: newEval.communication,
            discipline: newEval.discipline,
            attitude: newEval.attitude,
            weight: newEval.weight,
            note: newEval.note
          })
        });
        if (!res.ok) {
          const contentType = res.headers.get("content-type");
          let errMessage = "Thêm đánh giá thất bại";

          if (contentType && contentType.includes("application/json")) {
            const errData = await res.json();
            if (errData.errors && typeof errData.errors === "object") {
              // Lấy tất cả giá trị trong errors và nối bằng dấu phẩy
              errMessage = Object.values(errData.errors)
                .filter((msg) => typeof msg === "string" && msg.trim())
                .join(", ");
            }
           }

          throw new Error(errMessage);
        }

        // ---- thành công ----
        toast.success("Thêm đánh giá thành công!");

        // refresh team data
        const refresh = await fetch(`${ROOT_API}/api/evaluations/team/${teamId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await refresh.json();
        const team = Array.isArray(data) ? data[0] : data;
        setTeamData(team);
        setSelectedIntern(team.interns.find(i => i.intern_id === selectedIntern.intern_id));
        setOpenAddModal(false);
        setNewEval({ title: "", technical: 5, communication: 5, discipline: 5, attitude: 5, weight: 50, note: "" });

      } catch (err) {
        const msg = (err && err.message) ? err.message : "Thao tác thất bại";
        toast.error(msg);
      }
    };


  const averages = calculateAverages()

  const handleDeleteEvaluation = async (evaluationId) => {

    try {
      const res = await fetch(`${ROOT_API}/api/evaluations/${evaluationId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) throw new Error("Xóa thất bại")

      // refresh data
      const refresh = await fetch(`${ROOT_API}/api/evaluations/team/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await refresh.json()
      const team = Array.isArray(data) ? data[0] : data

      setTeamData(team)
      const intern = team.interns.find(i => i.intern_id === selectedIntern.intern_id)
      setSelectedIntern(intern)

      toast.success("Xóa đánh giá thành công!");
    } catch (err) {
      toast.error(err.message);
    }
  }
  const handleUpdateEvaluation = async () => {
    try {
      const res = await fetch(`${ROOT_API}/api/evaluations/${editEval.evaluation_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...editEval,
          mentorId: mentor.mentorId,
          internId: selectedIntern.intern_id
        })
      })
        if (!res.ok) {
          const contentType = res.headers.get("content-type");
          let errMessage = "Thêm đánh giá thất bại";

          if (contentType && contentType.includes("application/json")) {
            const errData = await res.json();
            if (errData.errors && typeof errData.errors === "object") {
              // Lấy tất cả giá trị trong errors và nối bằng dấu phẩy
              errMessage = Object.values(errData.errors)
                .filter((msg) => typeof msg === "string" && msg.trim())
                .join(", ");
            }
           }

          throw new Error(errMessage);
        }

      const refresh = await fetch(`${ROOT_API}/api/evaluations/team/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await refresh.json()
      const team = Array.isArray(data) ? data[0] : data

      setTeamData(team)
      const intern = team.interns.find(i => i.intern_id === selectedIntern.intern_id)
      setSelectedIntern(intern)

      setOpenEditModal(false)
      toast.success("Chỉnh sửa đánh giá thành công!");
    } catch (err) {
      toast.error(err.message);
    }
  }
  const openEditForm = (evaluation) => {
    setEditEval({ ...evaluation })
    setOpenEditModal(true)
  }
    const handleSendEvaluation = async () => {
      try {
        // 🔍 KIỂM TRA xem có thực tập sinh nào chưa được đánh giá không
        const internsWithoutEval = teamData.interns.filter(
          (intern) => !intern.evaluations || intern.evaluations.length === 0
        );

        if (internsWithoutEval.length > 0) {
          // Lấy danh sách tên những người chưa đánh giá
          const names = internsWithoutEval.map((i) => i.intern_name).join(", ");
          toast.error(`Thực tập sinh ${names} chưa được đánh giá. Hãy đánh giá tất cả thực tập sinh trước khi gửi.`);
          return; // ⛔ Không tiếp tục gửi API
        }

        // 🔥 Nếu tất cả đều đã được đánh giá → gửi API
        const res = await fetch(`${ROOT_API}/api/notifications/evaluation-summary`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(teamData),
        });

        const responseText = await res.text();

        if (!res.ok) {
          toast.error(responseText || "Gửi đánh giá thất bại");
          return;
        }

        toast.success("Gửi đánh giá thành công!");
        console.log("Response Body:", responseText);

      } catch (err) {
        console.error(err);
        toast.error("Lỗi kết nối đến server");
      }
    };
    const handleSendIndividualEvaluation = async () => {
      try {
        if (!selectedIntern) {
          toast.error("Chưa chọn thực tập sinh");
          return;
        }

        if (!selectedIntern.evaluations || selectedIntern.evaluations.length === 0) {
          toast.error(`Thực tập sinh ${selectedIntern.intern_name} chưa có đánh giá`);
          return;
        }

        const payload = {
          teamId: teamData.team_id,
          teamName: teamData.display_name || display_name,
          interns: [selectedIntern], // 🔥 chỉ 1 intern
        };

        const res = await fetch(
          `${ROOT_API}/api/notifications/evaluation-summary`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        );

        const text = await res.text();
        if (!res.ok) {
          toast.error(text || "Gửi đánh giá cá nhân thất bại");
          return;
        }

        toast.success(`Đã gửi đánh giá cho ${selectedIntern.intern_name}`);
      } catch (err) {
        console.error(err);
        toast.error("Lỗi kết nối server");
      }
    };
  return (
    <div className={styles.container}>
      <div className={styles.container}>
            <button className={styles.backButton} onClick={onBack}>← Quay lại danh sách nhóm</button>

            <div className={styles.header}>
              <div className={styles.teamInfo}>
                <h1 className={styles.teamName}>{display_name}</h1>
              </div>
              <button
                className={styles.addButton}
                onClick={handleSendEvaluation}
              >
                📤 Gửi đánh giá cho toàn bộ nhóm
              </button>
            </div>

            <div className={styles.mainContent}>
              {/* PANEL TRÁI */}
              <div className={styles.leftPanel}>
                <h2 className={styles.panelTitle}>Thành viên nhóm</h2>

                <div className={styles.memberSection}>
                  <h3 className={styles.sectionTitle}>Chưa được đánh giá ({notEvaluatedInterns.length})</h3>
                  <div className={styles.memberList}>
                    {notEvaluatedInterns.map(intern => (
                      <button
                        key={intern.intern_id}
                        className={`${styles.memberItem} ${selectedIntern?.intern_id === intern.intern_id ? styles.active : ""}`}
                        onClick={() => setSelectedIntern(intern)}
                      >
                        <div className={styles.memberName}>{intern.intern_name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.memberSection}>
                  <h3 className={styles.sectionTitle}>Đã đánh giá ({evaluatedInterns.length})</h3>
                  <div className={styles.memberList}>
                    {evaluatedInterns.map(intern => (
                      <button
                        key={intern.intern_id}
                        className={`${styles.memberItem} ${styles.evaluated} ${selectedIntern?.intern_id === intern.intern_id ? styles.active : ""}`}
                        onClick={() => setSelectedIntern(intern)}
                      >
                        <div className={styles.memberName}>{intern.intern_name}</div>
                        <div className={styles.checkmark}>✓</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* PANEL PHẢI */}
              <div className={styles.rightPanel}>
                {selectedIntern && (
                  <>
                    <div className={styles.internInfo}>
                      <h2 className={styles.internName}>{selectedIntern.intern_name}</h2>
                      <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Email:</span>
                          <span className={styles.infoValue}>{selectedIntern.email}</span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>SĐT:</span>
                          <span className={styles.infoValue}>{selectedIntern.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.evaluationSection}>
                      <div className={styles.evalHeader}>
                        <h3 className={styles.evalTitle}>
                          Đánh giá ({selectedInternEvals.length})
                        </h3>

                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            className={styles.addButton}
                            onClick={() => setOpenAddModal(true)}
                          >
                            + Thêm đánh giá
                          </button>

                          <button
                            className={styles.sendButton}
                            onClick={handleSendIndividualEvaluation}
                            disabled={selectedInternEvals.length === 0}
                            title={
                              selectedInternEvals.length === 0
                                ? "Thực tập sinh chưa có đánh giá"
                                : "Gửi đánh giá cá nhân"
                            }
                          >
                            📤 Gửi đánh giá cá nhân
                          </button>
                        </div>
                      </div>

                      {openAddModal && (
                        <Modal title="Thêm đánh giá" onClose={() => setOpenAddModal(false)}>
                            <div className={styles.addEvalForm}>
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Tiêu đề</label>
                            <input
                              type="text"
                              className={styles.formInput}
                              value={newEval.title}
                              onChange={(e) => setNewEval({ ...newEval, title: e.target.value })}
                              placeholder="Ví dụ: Đánh giá giữa kỳ"
                            />
                          </div>

                          <div className={styles.criteriaRow}>
                            <div className={styles.formGroup}>
                              <label className={styles.formLabel}>Kỹ thuật (0-10)</label>
                               <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.1"
                                  className={styles.formInput}
                                  value={newEval.technical}
                                  onChange={(e) =>
                                    setNewEval({ ...newEval, technical: Number(e.target.value) || 0 })
                                  }
                                    onBlur={(e) => {
                                          let v = Number(e.target.value);
                                          if (isNaN(v)) v = 0;
                                          // Clamp về [0, 10]
                                          v = Math.min(10, Math.max(0, v));
                                          // Chuẩn theo step 0.1
                                          v = Math.round(v * 10) / 10;
                                          setNewEval({ ...newEval, technical: v });
                                        }}
                                />
                            </div>
                            <div className={styles.formGroup}>
                              <label className={styles.formLabel}>Giao tiếp (0-10)</label>
                              <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.1"
                                  className={styles.formInput}
                                  value={newEval.communication}
                                  onChange={(e) =>
                                    setNewEval({ ...newEval, communication: Number(e.target.value) || 0 })
                                  }
                                    onBlur={(e) => {
                                          let v = Number(e.target.value);
                                          if (isNaN(v)) v = 0;
                                          // Clamp về [0, 10]
                                          v = Math.min(10, Math.max(0, v));
                                          // Chuẩn theo step 0.1
                                          v = Math.round(v * 10) / 10;
                                          setNewEval({ ...newEval, communication: v });
                                        }}
                                />
                            </div>
                            <div className={styles.formGroup}>
                              <label className={styles.formLabel}>Kỷ luật (0-10)</label>
                              <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.1"
                                  className={styles.formInput}
                                  value={newEval.discipline}
                                  onChange={(e) =>
                                    setNewEval({ ...newEval, discipline: Number(e.target.value) || 0 })
                                  }
                                    onBlur={(e) => {
                                          let v = Number(e.target.value);
                                          if (isNaN(v)) v = 0;
                                          // Clamp về [0, 10]
                                          v = Math.min(10, Math.max(0, v));
                                          // Chuẩn theo step 0.1
                                          v = Math.round(v * 10) / 10;
                                          setNewEval({ ...newEval, discipline: v });
                                        }}
                                />
                            </div>
                            <div className={styles.formGroup}>
                              <label className={styles.formLabel}>Thái độ (0-10)</label>
                              <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.1"
                                  className={styles.formInput}
                                  value={newEval.attitude}
                                  onChange={(e) =>
                                    setNewEval({ ...newEval, attitude: Number(e.target.value) || 0 })
                                  }
                                    onBlur={(e) => {
                                          let v = Number(e.target.value);
                                          if (isNaN(v)) v = 0;
                                          // Clamp về [0, 10]
                                          v = Math.min(10, Math.max(0, v));
                                          // Chuẩn theo step 0.1
                                          v = Math.round(v * 10) / 10;
                                          setNewEval({ ...newEval, attitude: v });
                                        }}
                                />
                            </div>
                          </div>

                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Hệ số (%)</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              className={styles.formInput}
                              value={newEval.weight}
                              onChange={(e) => setNewEval({ ...newEval, weight: Number.parseInt(e.target.value) })}
                            />
                          </div>

                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Ghi chú</label>
                            <textarea
                              className={styles.formTextarea}
                              rows={3}
                              value={newEval.note}
                              onChange={(e) => setNewEval({ ...newEval, note: e.target.value })}
                              placeholder="Nhận xét thêm..."
                            />
                          </div>
                              <button className={styles.submitButton} onClick={handleAddEvaluation}>
                                Lưu đánh giá
                              </button>
                              <button className={styles.closeButton} onClick={() => setOpenAddModal(false)}>Đóng</button>
                            </div>
                        </Modal>
                      )}

                        {openEditModal && editEval && (
                          <Modal title="Chỉnh sửa đánh giá" onClose={() => setOpenEditModal(false)}>
                            <div className={styles.addEvalForm}>

                              {/* Tiêu đề */}
                              <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Tiêu đề</label>
                                <input
                                  type="text"
                                  className={styles.formInput}
                                  value={editEval.title}
                                  onChange={(e) => setEditEval({ ...editEval, title: e.target.value })}
                                />
                              </div>

                              {/* Các tiêu chí */}
                                <div className={styles.criteriaRow}>
                                  {(() => {
                                    const LABEL_VI = {
                                      technical: "Kỹ thuật",
                                      communication: "Giao tiếp",
                                      discipline: "Kỷ luật",
                                      attitude: "Thái độ",
                                    };
                                    const FIELDS = ["technical", "communication", "discipline", "attitude"];
                                    const MIN = 0;
                                    const MAX = 10;
                                    const STEP = 0.1;

                                    // Hàm tiện dụng: clamp và chuẩn step
                                    const normalize = (v) => {
                                      let num = Number(v);
                                      if (Number.isNaN(num)) num = MIN;
                                      // Clamp [MIN, MAX]
                                      num = Math.min(MAX, Math.max(MIN, num));
                                      // Làm tròn theo STEP (0.1 -> nhân 10, làm tròn, rồi chia 10)
                                      const factor = Math.round(1 / STEP); // 10 đối với 0.1
                                      num = Math.round(num * factor) / factor;
                                      return num;
                                    };

                                    return FIELDS.map((field) => (
                                      <div key={field} className={styles.formGroup}>
                                        <label className={styles.formLabel}>{LABEL_VI[field]}</label>
                                        <input
                                          type="number"
                                          min={MIN}
                                          max={MAX}
                                          step={STEP}
                                          inputMode="decimal" // gợi ý bàn phím số trên mobile
                                          className={styles.formInput}
                                          value={typeof editEval[field] === "number" ? editEval[field] : 0}
                                          onChange={(e) => {
                                            // Cho phép người dùng xóa tạm thời
                                            const raw = e.target.value;
                                            const num = raw === "" ? "" : Number(raw);
                                            setEditEval((prev) => ({ ...prev, [field]: num }));
                                          }}
                                          onBlur={(e) => {
                                            const normalized = normalize(e.target.value);
                                            setEditEval((prev) => ({ ...prev, [field]: normalized }));
                                          }}
                                        />
                                      </div>
                                    ));
                                  })()}
                                </div>

                              {/* Hệ số */}
                              <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Hệ số</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  className={styles.formInput}
                                  value={typeof editEval.weight === "number" ? editEval.weight : 0}
                                  onChange={(e) =>
                                    setEditEval({ ...editEval, weight: e.target.value === "" ? 0 : Number(e.target.value) })
                                  }
                                />
                              </div>

                              {/* Ghi chú */}
                              <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Ghi chú</label>
                                <textarea
                                  className={styles.formTextarea}
                                  rows={3}
                                  value={editEval.note || ""}
                                  onChange={(e) => setEditEval({ ...editEval, note: e.target.value })}
                                />
                              </div>

                              <button className={styles.submitButton} onClick={handleUpdateEvaluation}>
                                Lưu chỉnh sửa
                              </button>
                              <button className={styles.closeButton} onClick={() => setOpenEditModal(false)}>Đóng</button>
                            </div>
                          </Modal>
                      )}

                      {selectedInternEvals.map((evaluation) => (
                        <div key={evaluation.evaluation_id} className={styles.evalCard}>
                          <div className={styles.evalCardHeader}>
                            <h4 className={styles.evalTitle}>{evaluation.title} ({evaluation.created_at})</h4>
                            <div className={styles.evalActions}>
                              <button
                                className={styles.editButton}
                                onClick={() => openEditForm(evaluation)}
                              >
                                ✏️ Sửa
                              </button>
                              <button
                                className={styles.deleteButton}
                                onClick={() => setDeleteTarget(evaluation)}
                              >
                                🗑️ Xóa
                              </button>
                            </div>
                          </div>
                          <div className={styles.evalCriteria}>
                            {[
                              { label: "Kỹ thuật", value: evaluation.technical },
                              { label: "Giao tiếp", value: evaluation.communication },
                              { label: "Kỷ luật", value: evaluation.discipline },
                              { label: "Thái độ", value: evaluation.attitude },
                            ].map((item) => {
                              let color = "#4caf50"; // mặc định xanh lá
                              if (item.value <= 5) color = "#f44336";
                              else if (item.value <= 7) color = "#ffeb3b";

                              return (
                                <div key={item.label} className={styles.criteriaItem}>
                                  <span>{item.label}:</span>
                                  <div className={styles.barContainer}>
                                    <div
                                      className={styles.barFill}
                                      style={{
                                        width: `${(item.value / 10) * 100}%`,
                                        backgroundColor: color,
                                      }}
                                    />
                                  </div>
                                  <strong>{item.value}/10</strong>
                                </div>
                              )
                            })}
                            <div className={styles.criteriaItem}>
                              <span>Hệ số:</span>
                              <strong>{evaluation.weight}%</strong>
                            </div>
                          </div>
                          {evaluation.note && <p className={styles.evalNote}>{evaluation.note}</p>}
                        </div>
                      ))}

                        {deleteTarget && (
                          <Modal title="Xác nhận xóa" onClose={() => setDeleteTarget(null)}>
                            <div style={{ padding: "16px", fontFamily: "Segoe UI, sans-serif", color: "#111" }}>
                              <p style={{ marginBottom: "8px", fontSize: "14px" }}>Bạn có chắc muốn xóa đánh giá:</p>

                              <strong style={{ display: "block", fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>
                                {deleteTarget.title}
                              </strong>

                              <p style={{ fontSize: "13px", color: "#666", marginBottom: "16px" }}>
                                Ngày tạo: {deleteTarget.created_at}
                              </p>

                              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                                <button
                                  style={{
                                    backgroundColor: "#ef4444",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    padding: "10px 16px",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    transition: "background 0.2s ease",
                                  }}
                                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#dc2626")}
                                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#ef4444")}
                                  onClick={() => {
                                    handleDeleteEvaluation(deleteTarget.evaluation_id);
                                    setDeleteTarget(null);
                                  }}
                                >
                                  Xóa ngay
                                </button>

                                <button
                                  style={{
                                    backgroundColor: "#f3f4f6",
                                    color: "#111",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "8px",
                                    padding: "10px 16px",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    transition: "background 0.2s ease",
                                  }}
                                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#e5e7eb")}
                                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
                                  onClick={() => setDeleteTarget(null)}
                                >
                                  Hủy
                                </button>
                              </div>
                            </div>
                          </Modal>
                      )}

                         {averages && (
                           <div className={styles.averageSection}>
                             <h4 className={styles.averageTitle}>Điểm tổng kết</h4>
                             <div className={styles.averageGrid}>
                               {[
                                 { label: "Kỹ thuật", value: averages.technical },
                                 { label: "Giao tiếp", value: averages.communication },
                                 { label: "Kỷ luật", value: averages.discipline },
                                 { label: "Thái độ", value: averages.attitude },
                               ].map((item) => {
                                 let color = "#4caf50";
                                 if (item.value <= 5) color = "#f44336";
                                 else if (item.value <= 7) color = "#ffeb3b";

                                 return (
                                   <div key={item.label} className={styles.averageItem}>
                                     <span>{item.label}:</span>
                                     <div className={styles.barContainer}>
                                       <div
                                         className={styles.barFill}
                                         style={{
                                           width: `${Math.min((item.value / 10) * 100, 100)}%`,
                                           backgroundColor: color,
                                         }}
                                       />
                                     </div>
                                     <strong>{item.value.toFixed(1)}/10</strong>
                                   </div>
                                 )
                               })}
                               <div className={styles.averageItem}>
                                 <span>Điểm tổng:</span>
                                 <strong>{averages.totalScore.toFixed(1)}/10</strong>
                               </div>
                             </div>
                           </div>
                         )}

                      {selectedInternEvals.length === 0 && (
                        <div className={styles.noEvals}>
                          <p>Chưa có đánh giá. Nhấn "Thêm đánh giá" để tạo.</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  )
}
