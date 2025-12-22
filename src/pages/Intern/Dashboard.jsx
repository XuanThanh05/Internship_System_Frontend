import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import InternSidebar from '../../components/Layout/InternSidebar';
import LatestNotificationsWidget from '../../components/Dashboard/LatestNotificationsWidget';
import '../../styles/dashBoard.css';
// import avatar from "../../assets/avatar.png";
import { AuthContext } from '../../context/AuthContext';
import { getInternByUserId } from '../../api/internApi';
import { getTodayAttendance, checkIn, checkOut } from '../../api/attendanceApi';
import allowanceApi from '../../api/allowanceApi';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, token, loading: authLoading } = useContext(AuthContext);

   const userStatus =
      user?.userStatus ||
      Cookies.get("userStatus") ||
      "";
   const internStatus =
     user?.internStatus ||
     Cookies.get("internStatus") ||
     null;

   const internConfirmStatus =
     user?.internConfirmStatus ||
     Cookies.get("internConfirmStatus") ||
     null;
    // LIMITED only if user is NOT ACTIVE and NOT REJECTED
    const isLimitedIntern =
    userStatus !== "ACTIVE" && userStatus !== "REJECTED";

    const isFullyApprovedIntern =
      internStatus === "APPROVED" &&
      internConfirmStatus === "Approved" &&
      userStatus !== "INACTIVE" &&
      userStatus !== "PENDING_APPROVAL";

    const disableAttendanceActions =
      userStatus === "REJECTED" &&
      internStatus === "APPROVED" &&
      internConfirmStatus === "Approved";

  const [internId, setInternId] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [hasCheckedOut, setHasCheckedOut] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [attendanceError, setAttendanceError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [monthlyAllowance, setMonthlyAllowance] = useState(0);
  const [taskStats, setTaskStats] = useState({
    inProgress: 0,
    todo: 0,
    done: 0,
    total: 0,
  });
  const [taskStatsLoading, setTaskStatsLoading] = useState(true);
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentTasksLoading, setRecentTasksLoading] = useState(true);
  const [programInfo, setProgramInfo] = useState(null);
  const [mentorInfo, setMentorInfo] = useState(null);
  const [programLoading, setProgramLoading] = useState(true);

  useEffect(() => {
    const fetchInternId = async () => {
      try {
        if (authLoading || !token) return;

        let userId = user?.userId;
        if (!userId) {
          const storedUserId = localStorage.getItem('userId');
          if (storedUserId) {
            userId = parseInt(storedUserId, 10);
          }
        }

        if (!userId || Number.isNaN(userId)) {
          setAttendanceError('Không tìm thấy thông tin thực tập sinh');
          return;
        }

        const response = await getInternByUserId(token, userId);
        const profile = response.internProfile || response;
        const resolvedInternId =
          profile.internId ||
          profile.id ||
          profile.internID ||
          profile.intern_id;

        if (!resolvedInternId) {
          setAttendanceError('Không tìm thấy hồ sơ thực tập sinh');
          return;
        }

        setInternId(resolvedInternId);
      } catch (error) {
        setAttendanceError('Không thể tải thông tin thực tập sinh');
      }
    };

    fetchInternId();
  }, [authLoading, token, user?.userId]);

  useEffect(() => {
    if (!token || !internId) return;
    loadTodayAttendance();
    fetchMonthlyAllowance();
    fetchTaskStats();
    fetchRecentTasks();
    fetchProgramAndMentor();
  }, [token, internId]);

  const fetchMonthlyAllowance = async () => {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      const response = await allowanceApi.getAllowancesByInternId(token, internId, 0, 100);

      const allowances = Array.isArray(response) ? response :
                       (response?.data || response?.content || []);

      const monthlyTotal = allowances
        .filter(allowance => {
          if (!allowance.dateApplied) return false;
          const allowanceDate = new Date(allowance.dateApplied);
          return (
            allowanceDate.getMonth() + 1 === currentMonth &&
            allowanceDate.getFullYear() === currentYear
          );
        })
        .reduce((sum, allowance) => sum + (allowance.amount || 0), 0);

      setMonthlyAllowance(monthlyTotal);
    } catch (error) {
      console.error('Error fetching monthly allowance:', error);
    }
  };

  const fetchTaskStats = async () => {
    try {
      if (!internId || !token) {
        setTaskStats({
          inProgress: 0,
          todo: 0,
          done: 0,
          total: 0,
        });
        setTaskStatsLoading(false);
        return;
      }

      setTaskStatsLoading(true);
      const res = await axiosClient.get(`/tasks/intern/${internId}/statistics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data || {};
      setTaskStats({
        inProgress: data.inProgress || 0,
        todo: data.todo || 0,
        done: data.done || 0,
        total: data.total || 0,
      });
    } catch (error) {
      console.error('Failed to fetch task statistics:', error);
      setTaskStats({
        inProgress: 0,
        todo: 0,
        done: 0,
        total: 0,
      });
    } finally {
      setTaskStatsLoading(false);
    }
  };

  const fetchRecentTasks = async () => {
    try {
      if (!internId || !token) {
        setRecentTasks([]);
        setRecentTasksLoading(false);
        return;
      }

      setRecentTasksLoading(true);
      const res = await axiosClient.get(`/tasks/intern/${internId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      const limited = data.slice(0, 3);
      setRecentTasks(limited);
    } catch (error) {
      console.error('Failed to fetch recent tasks:', error);
      setRecentTasks([]);
    } finally {
      setRecentTasksLoading(false);
    }
  };

  const fetchProgramAndMentor = async () => {
    try {
      if (!internId || !token) {
        setProgramInfo(null);
        setMentorInfo(null);
        setProgramLoading(false);
        return;
      }

      setProgramLoading(true);

      const res = await axiosClient.get(`/programs/intern/${internId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let program = null;
      const data = res.data;

      if (Array.isArray(data) && data.length > 0) {
        const programEvent = data.find((e) => e.type === 'program') || data[0];
        if (programEvent) {
          program = {
            id: programEvent.id,
            name: programEvent.title,
            description: programEvent.description,
            startDate: programEvent.startDate || programEvent.dateTime || programEvent.start,
          };
        }
      }

      setProgramInfo(program);

      let numericProgramId = null;
      try {
        const tasksRes = await axiosClient.get(`/tasks/intern/${internId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const tasksData = Array.isArray(tasksRes.data)
          ? tasksRes.data
          : Array.isArray(tasksRes.data?.data)
            ? tasksRes.data.data
            : [];

        if (tasksData.length > 0 && tasksData[0].programId) {
          numericProgramId = tasksData[0].programId;
        }
      } catch (taskErr) {
        console.error('Failed to fetch tasks for mentor lookup:', taskErr);
      }

      if (!numericProgramId && program?.id) {
        const parsed = parseInt(String(program.id), 10);
        if (!Number.isNaN(parsed)) {
          numericProgramId = parsed;
        }
      }

      let mentor = null;
      if (numericProgramId) {
        try {
          const mentorRes = await axiosClient.get(`/teams/${numericProgramId}/mentors`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const mentors = Array.isArray(mentorRes.data) ? mentorRes.data : [];
          if (mentors.length > 0) {
            const m = mentors[0];
            mentor = {
              name: m.fullName || m.mentorName || m.name || 'Mentor',
              email: m.email || '',
            };
          }
        } catch (mentorErr) {
          console.error('Failed to fetch mentors for program:', mentorErr);
        }
      }

      setMentorInfo(mentor);
    } catch (error) {
      console.error('Failed to fetch program info:', error);
      setProgramInfo(null);
      setMentorInfo(null);
    } finally {
      setProgramLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadTodayAttendance = async () => {
    try {
      setAttendanceLoading(true);
      setAttendanceError(null);
      const data = await getTodayAttendance(token, internId);
      setTodayAttendance(data.attendance);
      setHasCheckedIn(data.hasCheckedIn);
      setHasCheckedOut(!!data.attendance?.checkOut);
    } catch (error) {
      setAttendanceError('Không thể tải trạng thái chấm công hôm nay');
      setTodayAttendance(null);
      setHasCheckedIn(false);
      setHasCheckedOut(false);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleQuickCheckIn = async () => {
    try {
      await checkIn(token, internId);
      toast.success('Check-in thành công!');
      loadTodayAttendance();
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Lỗi khi check-in';
      toast.error(message);
    }
  };

  const handleQuickCheckOut = async () => {
    try {
      const result = await checkOut(token, internId);
      const hours = Math.floor(result.workingMinutes / 60);
      const minutes = result.workingMinutes % 60;
      toast.success(`Check-out thành công! (Làm việc: ${hours}h ${minutes} phút)`);
      loadTodayAttendance();
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Lỗi khi check-out';
      toast.error(message);
    }
  };

  const formatTime = (value) => {
    if (!value) return '--:--';
    return value.substring(0, 5);
  };

  const formatTimeFromDate = (date) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const getTaskStatusLabel = (status) => {
    const map = {
      TODO: 'Chưa bắt đầu',
      IN_PROGRESS: 'Đang thực hiện',
      REVIEWED: 'Đã xem xét',
      DONE: 'Hoàn thành',
    };
    return map[status] || status || 'Không rõ';
  };

  const getTaskStatusClass = (status) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'status doing';
      case 'DONE':
        return 'status done';
      case 'TODO':
      case 'REVIEWED':
      default:
        return 'status pending';
    }
  };

  const formatTaskDeadline = (deadline) => {
    if (!deadline) return '--';
    try {
      return new Date(deadline).toLocaleDateString('vi-VN');
    } catch (e) {
      return '--';
    }
  };

  const formatProgramName = (name) => {
    if (!name) return '';
    return name.replace(/^Bắt đầu chương trình:\s*/i, '').trim();
  };

  const checkInStatusText = attendanceLoading
    ? 'Đang tải...'
    : hasCheckedIn
      ? (hasCheckedOut ? 'Đã hoàn tất' : 'Đã check-in')
      : 'Chưa check-in';

  return (
    <div className="dashboard-layout">
      <InternSidebar />
      <div className="dashboard-content">
        <h2 className="page-title">Dashboard thực tập sinh</h2>

        <div className="dashboard-top-grid">
          <div
            className={`stat-card clickable-card ${
                !isFullyApprovedIntern ? "disabled-card" : ""
              }`}
            onClick={() => {
                if (!isFullyApprovedIntern) return;
                navigate("/intern/tasks");
              }}
          >
            <div className="stat-icon intern">📋</div>
            <div>
              <h4>Nhiệm vụ</h4>
              <p className="stat-value">
                {taskStatsLoading
                  ? 'Đang tải...'
                  : taskStats.inProgress + taskStats.todo}
              </p>
            </div>
          </div>

          <div
            className={`stat-card clickable-card ${
                !isFullyApprovedIntern ? "disabled-card" : ""
              }`}
            onClick={() => {
                if (!isFullyApprovedIntern) return;
                navigate("/intern/allowance");
              }}
          >
            <div className="stat-icon intern"></div>
            <div>
              <h4>Phụ cấp tháng</h4>
              <p className="stat-value">{formatCurrency(monthlyAllowance)}</p>
            </div>
          </div>

          {isFullyApprovedIntern && (
          <div
            className="quick-checkin-card card clickable-card"
            onClick={() => navigate('/intern/attendance')}
          >
            <h4>Chấm công</h4>
            {attendanceError && (
              <p className="attendance-error-text">{attendanceError}</p>
            )}
            {!attendanceError && (
              <>
                <div className="attendance-times">
                  <div className="time-block">
                    <span>Check-in</span>
                    <strong>
                      {attendanceLoading
                        ? 'Đang tải...'
                        : !hasCheckedIn
                        ? formatTimeFromDate(currentTime)
                        : formatTime(todayAttendance?.checkIn)}
                    </strong>
                  </div>
                  <div className="time-block">
                    <span>Check-out</span>
                    <strong>
                      {attendanceLoading
                        ? 'Đang tải...'
                        : !hasCheckedIn
                        ? '--:--'
                        : formatTimeFromDate(currentTime)}
                    </strong>
                  </div>
                </div>
                <div className="attendance-actions">
                  <button
                    className="checkin-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickCheckIn();
                    }}
                    disabled={attendanceLoading || hasCheckedIn || disableAttendanceActions}
                  >
                    {hasCheckedIn ? '✓ Đã check-in' : 'Check-in'}
                  </button>
                  <button
                    className="checkout-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickCheckOut();
                    }}
                    disabled={attendanceLoading || !hasCheckedIn ||  disableAttendanceActions}
                  >
                    {hasCheckedOut ? 'Check-out' : 'Check-out'}
                  </button>
                </div>
              </>
            )}
          </div>
          )}

          <div className="card mentor-card">
            <h4>Mentor & chương trình thực tập</h4>
            <div className="mentor-info">
{/*               <img src={avatar} alt="avatar" /> */}
              <div>
                <p>
                  {programLoading
                    ? 'Đang tải...'
                    : mentorInfo?.name || 'Chưa có mentor'}
                </p>
                <p className="email">
                  {programLoading ? '' : mentorInfo?.email || ''}
                </p>
              </div>
            </div>
            <p>
              Chương trình:{' '}
              {programLoading
                ? 'Đang tải...'
                : programInfo?.name
                  ? formatProgramName(programInfo.name)
                  : 'Chưa có chương trình'}
            </p>
          </div>
        </div>

        <div className="bottom-grid">
          <div
            className={`card recent-tasks-card clickable-card ${
                !isFullyApprovedIntern ? "disabled-card" : ""
              }`}
            onClick={() => {
                if (!isFullyApprovedIntern) return;
                navigate("/intern/tasks");
              }}
          >
            <h4>Nhiệm vụ gần đây</h4>
            <table className="task-table">
              <thead>
                <tr>
                  <th>Nhiệm vụ</th>
                  <th>Trạng thái</th>
                  <th>Deadline</th>
                </tr>
              </thead>
              <tbody>
                {recentTasksLoading ? (
                  <tr>
                    <td colSpan="3">Đang tải...</td>
                  </tr>
                ) : recentTasks.length === 0 ? (
                  <tr>
                    <td colSpan="3">Không có nhiệm vụ nào gần đây</td>
                  </tr>
                ) : (
                  recentTasks.map((task) => (
                    <tr key={task.taskId}>
                      <td>{task.title || `Nhiệm vụ #${task.taskId}`}</td>
                      <td className={getTaskStatusClass(task.status)}>
                        {getTaskStatusLabel(task.status)}
                      </td>
                      <td>{formatTaskDeadline(task.deadline)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <LatestNotificationsWidget token={token} internId={internId} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
