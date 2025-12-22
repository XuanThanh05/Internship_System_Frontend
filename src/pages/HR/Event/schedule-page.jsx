import React, { useState, useEffect, useContext } from "react"
import ScheduleLayout from "./schedule-layout"
import CalendarView from "./calendar-view"
import WeekView from "./week-view"
import { AuthContext } from "../../../context/AuthContext"
import axios from "axios"
import EventTooltip from "./EventTooltip"
import EventModal from "./EventModal"
import CreateEventModal from "./CreateEventModal"
import { toast } from "react-toastify"
import { ROOT_API } from "../../../api/rootApi";
export default function SchedulePage() {
  const { token, user } = useContext(AuthContext)
  const [viewType, setViewType] = useState("calendar")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [programs, setPrograms] = useState([])
  const [selectedProgramId, setSelectedProgramId] = useState("")
  const [hoveredEvent, setHoveredEvent] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)

  const [selectedDate, setSelectedDate] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const setHoveredEventWithPosition = (event, position) => {
    if (!event) {
      setHoveredEvent(null)
      return
    }

    setHoveredEvent(event)
    setTooltipPosition(position)
  }
  const handleOpenEventModal = (event) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const eventDate = new Date(event.date)
    eventDate.setHours(0, 0, 0, 0)

    setSelectedEvent({
      ...event,
      isPast: eventDate < today,
    })

    setIsEventModalOpen(true)
  }

  const handleOpenCreateModal = (date) => {
    setSelectedDate(date)
    setIsCreateModalOpen(true)
  }

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await axios.get(
          `${ROOT_API}/api/programs?page=1&size=5&sortBy=name&sortDir=asc`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        setPrograms(res.data.data)
      } catch (err) {
        console.error(err)
      }
    }

    if (token) fetchPrograms()
  }, [token])
  const fetchProgramEvents = async () => {
    if (!selectedProgramId) return

    try {
      setLoading(true)
      const res = await axios.get(
        `${ROOT_API}/api/program-events/program/${selectedProgramId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const formatted = res.data.map((e) => ({
        id: e.eventId,
        title: e.title,
        location: e.location,
        date: new Date(e.eventDate),
        startTime: e.startTime,
        endTime: e.endTime,
        description: e.description,
      }))

      setEvents(formatted)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    if (!selectedProgramId) {
      setEvents([])
      return
    }

    fetchProgramEvents()
  }, [selectedProgramId, token])

  const handleCreateEvent = async (data) => {
    try {
      await axios.post(
        `${ROOT_API}/api/program-events`,
        {
          programId: selectedProgramId,
          ...data,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      toast.success("Tạo sự kiện thành công ")
      setIsCreateModalOpen(false)
      fetchProgramEvents()
    } catch (err) {
      const backendMsg = err?.response?.data?.message
      const displayMsg = extractBackendMessage(backendMsg)

      toast.error(displayMsg)
    }
  }
  const extractBackendMessage = (msg) => {
    const match = msg?.match(/"([^"]+)"/)
    return match ? match[1] : "Có lỗi xảy ra"
  }
  const handleUpdateEvent = async (id, data) => {
    try {
      await axios.put(
        `${ROOT_API}/api/program-events/${id}`,
        {
          programId: selectedProgramId,
          ...data,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      toast.success("Cập nhật sự kiện thành công")
      setIsEventModalOpen(false)
      fetchProgramEvents()
    } catch (err) {
      toast.error("Cập nhật thất bại")
    }
  }
  const handleDeleteEvent = async (id) => {
    try {
      await axios.delete(
        `${ROOT_API}/api/program-events/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      toast.success("Đã xóa sự kiện")
      setIsEventModalOpen(false)
      fetchProgramEvents()
    } catch (err) {
      toast.error("Xóa thất bại")
    }
  }

  if (loading) return <p>Đang tải dữ liệu...</p>
  if (error) return <p>Lỗi: {error}</p>


  return (
    <>
        <ScheduleLayout
          viewType={viewType}
          onViewChange={setViewType}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          programs={programs}
          selectedProgramId={selectedProgramId}
          onProgramChange={setSelectedProgramId}
        >
          {loading ? (
            <p>Đang tải dữ liệu...</p>
          ) : !selectedProgramId ? (
            <p style={{ padding: 20 }}>Vui lòng chọn chương trình thực tập</p>
          ) : viewType === "calendar" ? (
            <CalendarView
              events={events}
              currentDate={currentDate}
              onEventHover={setHoveredEventWithPosition}
              onEventClick={handleOpenEventModal}
              onDateClick={handleOpenCreateModal}
            />
          ) : viewType === "week" ? (
            <WeekView
              currentDate={currentDate}
              events={events}
              onEventHover={setHoveredEventWithPosition}
              onEventClick={handleOpenEventModal}
              onDateClick={handleOpenCreateModal}
            />
          ) : null}
        </ScheduleLayout>
          <>
            {/* Tooltip */}
            <EventTooltip event={hoveredEvent} position={tooltipPosition} />

            {/* Modal xem sự kiện */}
            {isEventModalOpen && (
              <EventModal
                event={selectedEvent}
                    onClose={() => setIsEventModalOpen(false)}
                    onUpdate={handleUpdateEvent}
                    onDelete={handleDeleteEvent}
              />
            )}

            {/* Modal tạo sự kiện */}
            {isCreateModalOpen && (
              <CreateEventModal
                date={selectedDate}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateEvent}
              />
            )}
          </>
      </>
  )
}
