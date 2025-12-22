
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import styles from "./ProgramListPage.module.css";
import { AuthContext } from "../../../context/AuthContext";
import { ROOT_API } from "../../../api/rootApi";
export default function ProgramListPage({ onSelectProgram }) {
  const { token, user } = useContext(AuthContext);

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchPrograms() {
      setLoading(true);
      setErrorMsg("");

      try {
        // Lấy userId của mentor từ AuthContext
        const userId = user?.userId;
        if (!userId) {
          throw new Error("Không tìm thấy userId trong AuthContext.");
        }

        const res = await axios.get(
          `${ROOT_API}/api/programs/mentor/${userId}/ongoing`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = Array.isArray(res.data) ? res.data : [];

        const normalized = data.map((p) => ({
          program_id: p.program_id,
          program_name: p.program_name,
          description: p.description,
          start_date: formatDate(p.start_date),
          end_date: formatDate(p.end_date),
        }));

        if (isMounted) setPrograms(normalized);
      } catch (err) {
        console.error("Fetch programs failed:", err);
        if (isMounted) {
          setErrorMsg(
            err.response?.data?.message ||
              err.message ||
              "Không thể tải danh sách chương trình."
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (token && user) {
      fetchPrograms();
    } else {
      setLoading(false);
      setErrorMsg("Chưa đăng nhập hoặc thiếu thông tin người dùng.");
    }

    return () => {
      isMounted = false;
    };
  }, [token, user]);

  function formatDate(input) {
    if (!input) return "";
    try {
      const d = new Date(input);
      if (Number.isNaN(d.getTime())) {
        const idx = input.indexOf("T");
        return idx > 0 ? input.slice(0, idx) : input;
      }
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      const idx = input.indexOf("T");
      return idx > 0 ? input.slice(0, idx) : input;
    }
  }

  if (loading) {
    return <div className={styles.container}>Đang tải chương trình...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Hệ thống đánh giá thực tập sinh</h1>
        <p className={styles.subtitle}>
          Chọn 1 chương trình đang diễn ra để xem và đánh giá thực tập sinh
        </p>
      </div>

      {errorMsg && <div className={styles.error}>{errorMsg}</div>}

      {programs.length === 0 ? (
        <div className={styles.noData}>Không có chương trình nào đang diễn ra</div>
      ) : (
        <div className={styles.gridContainer}>
          {programs.map((program) => (
            <div
              key={program.program_id}
              className={styles.programCard}
              onClick={() => onSelectProgram(program.program_id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onSelectProgram(program.program_id)}
            >
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>{program.program_name}</h2>
              </div>

              <p className={styles.cardDescription}>
                {program.description ?? ""}
              </p>

              <div className={styles.dateInfo}>
                <div className={styles.dateItem}>
                  <span className={styles.dateLabel}>Bắt đầu:</span>
                  <span className={styles.dateValue}>{program.start_date}</span>
                </div>
                <div className={styles.dateItem}>
                  <span className={styles.dateLabel}>Kết thúc:</span>
                  <span className={styles.dateValue}>{program.end_date}</span>
                </div>
              </div>

              <button
                className={styles.selectButton}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectProgram(program.program_id);
                }}
              >
                Xem chương trình →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};