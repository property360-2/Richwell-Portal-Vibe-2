import { useEffect, useState } from 'react';
import Alert from '../../components/Alert.jsx';
import Button from '../../components/Button.jsx';
import InputField from '../../components/InputField.jsx';
import Modal from '../../components/Modal.jsx';
import Table from '../../components/Table.jsx';
import AppShell from '../../layouts/AppShell.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

function RegistrarStudents() {
  const { token, apiRequest } = useAuth();
  const [query, setQuery] = useState('');
  const [programId, setProgramId] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [status, setStatus] = useState('');
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [programs, setPrograms] = useState([]);
  const [modal, setModal] = useState({ open: false, detail: null });
  const [loading, setLoading] = useState(false);

  const load = async (nextPage = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (programId) params.set('programId', programId);
      if (yearLevel) params.set('yearLevel', yearLevel);
      if (status) params.set('status', status);
      params.set('page', String(nextPage));
      params.set('pageSize', String(pageSize));
      const res = await apiRequest(`/registrar/students?${params.toString()}`, { token });
      setRows(res.students || []);
      setTotal(res.total || 0);
      setPage(res.page || nextPage);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    apiRequest('/registrar/programs', { token }).then((data) => setPrograms(data.programs || []));
  }, [apiRequest, token]);

  const viewDetail = async (id) => {
    try {
      const res = await apiRequest(`/registrar/students/${id}`, { token });
      setModal({ open: true, detail: res });
    } catch (err) {
      setError(err.message);
    }
  };

  const updateStatus = async (id, newStatus) => {
    await apiRequest(`/registrar/students/${id}/status`, {
      token,
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    });
    await load(page);
    const updated = await apiRequest(`/registrar/students/${id}`, { token });
    setModal((prev) => ({ ...prev, detail: updated }));
  };

  const closeModal = () => setModal({ open: false, detail: null });

  return (
    <div className="space-y-6">
      <AppShell.PageHeader
        title="Student records"
        description="Search, verify, and maintain accurate student dossiers."
        breadcrumbs={[{ label: 'Registrar', to: '/registrar/dashboard' }, { label: 'Student Records' }]}
      />

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="grid gap-3 sm:grid-cols-4">
        <InputField placeholder="Search name/email/student no" value={query} onChange={(event) => setQuery(event.target.value)} />
        <div>
          <label className="block text-sm font-medium text-slate-700">Program</label>
          <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={programId} onChange={(event) => setProgramId(event.target.value)}>
            <option value="">All</option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.code}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Year Level</label>
          <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={yearLevel} onChange={(event) => setYearLevel(event.target.value)}>
            <option value="">All</option>
            {[1, 2, 3, 4].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Status</label>
          <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All</option>
            <option value="regular">regular</option>
            <option value="irregular">irregular</option>
            <option value="inactive">inactive</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <span>Total: {total} • Page {page}</span>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => load(Math.max(1, page - 1))}>
            Prev
          </Button>
          <Button variant="secondary" size="sm" onClick={() => load(page + 1)}>
            Next
          </Button>
          <Button size="sm" onClick={() => load(1)}>
            Apply Filters
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading students…</p>
      ) : (
        <Table
          columns={[
            { header: 'Student No', accessor: 'studentNo' },
            { header: 'Name', accessor: 'name' },
            { header: 'Program', accessor: 'program' },
            { header: 'Year', accessor: 'yearLevel' },
            { header: 'Status', accessor: 'status' },
            { header: 'Missing Docs', accessor: 'missingDocs' },
            {
              header: 'Actions',
              accessor: 'actions',
              render: (_, row) => (
                <Button variant="secondary" size="sm" onClick={() => viewDetail(row.id)}>
                  View Details
                </Button>
              )
            }
          ]}
          data={rows.map((student) => ({
            id: student.id,
            studentNo: student.studentNo,
            name: `${student.user.firstName} ${student.user.lastName}`,
            program: student.program.code,
            yearLevel: student.yearLevel,
            status: student.status,
            missingDocs: 'No'
          }))}
          emptyMessage="No students found"
        />
      )}

      <Modal
        open={modal.open}
        onClose={closeModal}
        title={modal.detail ? `Student #${modal.detail.student.id}` : 'Details'}
        primaryAction={null}
        secondaryAction={
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
        }
      >
        {!modal.detail ? (
          <p>Loading…</p>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <span className="text-xs text-slate-500">Name</span>
                <p className="text-sm font-medium">
                  {modal.detail.student.user.firstName} {modal.detail.student.user.lastName}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Program</span>
                <p className="text-sm font-medium">{modal.detail.student.program.code}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Status</span>
                <p className="text-sm font-medium">{modal.detail.student.status}</p>
              </div>
              <div className="flex items-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => updateStatus(modal.detail.student.id, 'regular')}>
                  Mark Verified
                </Button>
                <Button variant="danger" size="sm" onClick={() => updateStatus(modal.detail.student.id, 'inactive')}>
                  Archive
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Recent Enrollments</p>
              <Table
                columns={[
                  { header: 'Term', accessor: 'term' },
                  { header: 'Subjects', accessor: 'subjects' }
                ]}
                data={(modal.detail.student.enrollments || []).map((enrollment) => ({
                  id: enrollment.id,
                  term: `${enrollment.term.schoolYear} – ${enrollment.term.semester}`,
                  subjects: enrollment.subjects.map((subject) => subject.subject.code).join(', ')
                }))}
                emptyMessage="No enrollments"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Documents</p>
              <Alert>Documents module not yet implemented.</Alert>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default RegistrarStudents;
