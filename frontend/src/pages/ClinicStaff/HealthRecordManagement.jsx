import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudentsStore } from "../../store/studentsStore";
import DashboardCard from "../../components/dashboard/DashboardCard";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Modal from "../../components/ui/Modal";
import { formatDate } from "../../utils/formatDate";

const HealthRecordManagement = () => {
  const navigate = useNavigate();
  const {
    students,
    fetchAllStudents,
    loading: studentsLoading,
    updateStudent,
    getStudentStatistics,
  } = useStudentsStore();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filtered, setFiltered] = useState([]);

  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editData, setEditData] = useState({ bloodType: "", allergies: "", height: "", weight: "" });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchAllStudents({ page: 1, limit: 100 });
      setStats(getStudentStatistics());
      setLoading(false);
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setFiltered(students || []);
      return;
    }
    setFiltered(
      (students || []).filter((s) => {
        const fullName = `${s.firstName || ""} ${s.middleName || ""} ${s.lastName || ""}`.toLowerCase();
        return (
          fullName.includes(q) ||
          (s.studentId || "").toLowerCase().includes(q) ||
          (s.course?.code || "").toLowerCase().includes(q)
        );
      })
    );
  }, [searchQuery, students]);

  const studentsToShow = useMemo(() => (searchQuery ? filtered : students || []), [searchQuery, filtered, students]);

  const openView = (student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  const openEdit = (student) => {
    setSelectedStudent(student);
    setEditData({
      bloodType: student.bloodType || "",
      allergies: student.allergies || "",
      height: student.height || "",
      weight: student.weight || "",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      await updateStudent(selectedStudent.id, {
        ...selectedStudent,
        bloodType: editData.bloodType,
        allergies: editData.allergies,
        height: editData.height,
        weight: editData.weight,
      });
      // refresh list
      await fetchAllStudents({ page: 1, limit: 100 });
      setShowEditModal(false);
      setSelectedStudent(null);
    } catch (err) {
      console.error("Failed to update student health record", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Health Record Management</h1>
          <p className="text-gray-600">Manage student health profiles, baseline metrics and clinic visits</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <Button onClick={() => navigate('/clinic/students')} variant="outline" className="w-full sm:w-auto">Students</Button>
          <Button onClick={() => navigate('/clinic/visit-logging')} variant="outline" className="w-full sm:w-auto">Log Visit</Button>
          <Button onClick={() => navigate('/clinic/students')} variant="primary" className="w-full sm:w-auto">Add Health Record</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashboardCard title="Total Students" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600">{stats ? stats.total : '—'}</div>
          <p className="text-xs text-gray-500 mt-1">Active: {stats ? stats.active : '—'}</p>
        </DashboardCard>

        <DashboardCard title="Average Age" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600">{stats ? stats.averageAge : '—'}</div>
          <p className="text-xs text-gray-500 mt-1">Overall average</p>
        </DashboardCard>

        <DashboardCard title="With Allergies" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-purple-600">{(students || []).filter(s => s.allergies).length}</div>
          <p className="text-xs text-gray-500 mt-1">Students with recorded allergies</p>
        </DashboardCard>

        <DashboardCard title="Recent Visits" className="text-center">
          <div className="text-sm text-gray-700">View recent clinic visits in visit logs</div>
        </DashboardCard>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name, ID or course" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
            <select className="w-full p-2 border border-gray-300 rounded-md bg-white" onChange={(e) => { const v=e.target.value; setFiltered((students||[]).filter(s=>!v||s.gradeLevel===v)); }}>
              <option value="">All</option>
              {(students || []).map(s => s.gradeLevel).filter((v,i,a)=>v && a.indexOf(v)===i).map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={() => { setSearchQuery(''); setFiltered(students || []); }} variant="outline" className="w-full sm:w-auto">Clear</Button>
            <Button onClick={() => fetchAllStudents({ page: 1, limit: 100 })} variant="primary" className="w-full sm:w-auto">Refresh</Button>
          </div>
        </div>
      </div>

      {/* Students Table (responsive) */}
      <DashboardCard title={`Health Records (${studentsToShow.length})`}>
        {loading || studentsLoading ? (
          <div className="flex items-center justify-center h-40">
            <LoadingSpinner />
          </div>
        ) : studentsToShow.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No records found</div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-3 py-2">Student</th>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Blood Type</th>
                    <th className="px-3 py-2">Allergies</th>
                    <th className="px-3 py-2">Last Visit</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsToShow.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="px-3 py-3 text-sm text-gray-900">{s.firstName} {s.middleName ? s.middleName + ' ' : ''}{s.lastName}</td>
                      <td className="px-3 py-3 text-sm text-gray-600">{s.studentId || 'N/A'}</td>
                      <td className="px-3 py-3 text-sm text-gray-600">{s.bloodType || 'N/A'}</td>
                      <td className="px-3 py-3 text-sm text-gray-600">{s.allergies || 'None'}</td>
                      <td className="px-3 py-3 text-sm text-gray-600">{s.lastVisit ? formatDate(s.lastVisit) : 'N/A'}</td>
                      <td className="px-3 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => openView(s)}>View</Button>
                          <Button variant="outline" size="sm" onClick={() => openEdit(s)}>Edit</Button>
                          <Button variant="primary" size="sm" onClick={() => navigate(`/clinic/visit-logging?studentId=${s.id}`)}>Log Visit</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden space-y-3">
              {studentsToShow.map((s) => (
                <div key={s.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{s.firstName} {s.middleName ? s.middleName + ' ' : ''}{s.lastName}</div>
                      <div className="text-sm text-gray-600 mt-1">ID: {s.studentId || 'N/A'}</div>
                      <div className="text-sm text-gray-600">Blood: {s.bloodType || 'N/A'}</div>
                      <div className="text-sm text-gray-600">Allergies: {s.allergies || 'None'}</div>
                      <div className="text-xs text-gray-500 mt-1">Last Visit: {s.lastVisit ? formatDate(s.lastVisit) : 'N/A'}</div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2">
                    <Button className="w-full" variant="outline" onClick={() => openView(s)}>View</Button>
                    <Button className="w-full" variant="outline" onClick={() => openEdit(s)}>Edit</Button>
                    <Button className="w-full" variant="primary" onClick={() => navigate(`/clinic/visit-logging?studentId=${s.id}`)}>Log Visit</Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </DashboardCard>

      {/* View Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="View Health Record" size="lg">
        {selectedStudent ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Name</div>
                <div className="font-medium text-gray-900">{selectedStudent.firstName} {selectedStudent.lastName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Student ID</div>
                <div className="font-medium text-gray-900">{selectedStudent.studentId || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Blood Type</div>
                <div className="font-medium text-gray-900">{selectedStudent.bloodType || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Allergies</div>
                <div className="font-medium text-gray-900">{selectedStudent.allergies || 'None'}</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold">Recent Visits</h4>
              <div className="mt-2 space-y-2">
                {(selectedStudent.visits || []).length === 0 ? (
                  <div className="text-sm text-gray-500">No visits recorded</div>
                ) : (
                  (selectedStudent.visits || []).slice(0,5).map(v => (
                    <div key={v.id} className="p-3 border rounded bg-gray-50">
                      <div className="text-sm text-gray-800 font-medium">{v.reason || 'Visit'}</div>
                      <div className="text-xs text-gray-500">{v.date ? formatDate(v.date) : 'N/A'}</div>
                      <div className="text-sm text-gray-700">{v.notes || ''}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">No data</div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Health Record" size="lg">
        {selectedStudent ? (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Blood Type" value={editData.bloodType} onChange={(e) => setEditData({...editData, bloodType: e.target.value})} />
              <Input label="Allergies" value={editData.allergies} onChange={(e) => setEditData({...editData, allergies: e.target.value})} />
              <Input label="Height (cm)" value={editData.height} onChange={(e) => setEditData({...editData, height: e.target.value})} />
              <Input label="Weight (kg)" value={editData.weight} onChange={(e) => setEditData({...editData, weight: e.target.value})} />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        ) : (
          <div className="p-6 text-center text-gray-500">No student selected</div>
        )}
      </Modal>
    </div>
  );
};

export default HealthRecordManagement;
