import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MentorSidebar from "../../components/Layout/MentorSidebar";
import TaskStats from "../../components/Dashboard/TaskStats";
import "../../styles/dashBoard.css";
// import avatar from "../../assets/avatar.png";
import { AuthContext } from "../../context/AuthContext";
import mentorApi from "../../api/mentorApi";
import hrApi from "../../api/hrApi";

const MentorDashboard = () => {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [internCount, setInternCount] = useState(0);
  const [interns, setInterns] = useState([]);
  const [mentorInfo, setMentorInfo] = useState(null);

  useEffect(() => {
    const fetchInternCountForMentor = async () => {
      if (!token || !user?.userId) return;

      try {
        const mentorData = await mentorApi.getMentorByUserId(token, user.userId);
        setMentorInfo(mentorData || null);

        if (!mentorData || !mentorData.mentorId) {
          setInternCount(0);
          return;
        }

        const mentorId = mentorData.mentorId;

        const programsRes = await hrApi.filterProgramsByMentor(token, mentorId);

        let programs = [];
        if (Array.isArray(programsRes)) {
          programs = programsRes;
        } else if (programsRes && Array.isArray(programsRes.data)) {
          programs = programsRes.data;
        } else if (programsRes && Array.isArray(programsRes.content)) {
          programs = programsRes.content;
        }

        if (!programs.length) {
          setInternCount(0);
          return;
        }

        const uniqueInternIds = new Set();
        const internMap = new Map();

        await Promise.all(
          programs.map(async (program) => {
            if (!program || !program.programId) return;

            try {
              const teamsRes = await hrApi.getTeamsInProgram(token, program.programId);

              let teams = [];
              if (Array.isArray(teamsRes)) {
                teams = teamsRes;
              } else if (teamsRes && Array.isArray(teamsRes.data)) {
                teams = teamsRes.data;
              } else if (teamsRes && Array.isArray(teamsRes.content)) {
                teams = teamsRes.content;
              }

              await Promise.all(
                teams.map(async (team) => {
                  if (!team || !team.teamId) return;

                  try {
                    const internsRes = await hrApi.getInternsInTeam(token, team.teamId);

                    let interns = [];
                    if (Array.isArray(internsRes)) {
                      interns = internsRes;
                    } else if (internsRes && Array.isArray(internsRes.data)) {
                      interns = internsRes.data;
                    } else if (internsRes && Array.isArray(internsRes.content)) {
                      interns = internsRes.content;
                    }

                    interns.forEach((intern) => {
                      if (intern && intern.internId != null) {
                        uniqueInternIds.add(intern.internId);

                        if (!internMap.has(intern.internId)) {
                          internMap.set(intern.internId, intern);
                        }
                      }
                    });
                  } catch (err) {
                    console.error("Error fetching interns in team:", err);
                  }
                })
              );
            } catch (err) {
              console.error("Error fetching teams in program:", err);
            }
          })
        );
        setInternCount(uniqueInternIds.size);
        setInterns(Array.from(internMap.values()));
      } catch (error) {
        console.error("Error fetching mentor intern count:", error);
        setInternCount(0);
        setInterns([]);
        setMentorInfo(null);
      }
    };

    fetchInternCountForMentor();
  }, [token, user]);

  return (
    <div className="dashboard-layout">
      <MentorSidebar />
      <div className="dashboard-content">
        <h2 className="page-title">Mentor Dashboard</h2>

        {/* Thống kê nhanh */}
        <div className="stats-row">
          <div
            className="stat-card clickable-card"
            onClick={() => navigate("/mentor/interns")}
          >
            <div className="stat-icon mentor">👨‍🏫</div>
            <div>
              <h4>Thực tập sinh đang hướng dẫn</h4>
              <p className="stat-value">{internCount}</p>
            </div>
          </div>
          <div
            className="stat-card clickable-card"
            onClick={() => navigate("/mentor/tasks")}
          >
            <TaskStats />
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="main-grid">
          <div
            className="card col-span-2 intern-list-card clickable-card"
            onClick={() => navigate("/mentor/interns")}
          >
            <h4>Danh sách thực tập sinh</h4>
            <table className="task-table">
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Ngành</th>
                </tr>
              </thead>
              <tbody>
                {interns.length === 0 ? (
                  <tr>
                    <td colSpan={2}>Không có thực tập sinh nào</td>
                  </tr>
                ) : (
                  interns.map((intern) => (
                    <tr key={intern.internId ?? intern.id}>
                      <td>{intern.fullName || intern.name || "-"}</td>
                      <td>{intern.major || intern.majorName || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="card mentor-info-card">
            <h4>Thông tin mentor</h4>
            <div className="mentor-info">
{/*               <img src={avatar} alt="avatar" /> */}
              <div>
                <p>{mentorInfo?.fullName || mentorInfo?.name || mentorInfo?.mentorName || user?.fullName || user?.username || "Mentor"}</p>
                <p className="email">{mentorInfo?.email || user?.email || ""}</p>
              </div>
            </div>
            <p>Số lượng TTS: {internCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
