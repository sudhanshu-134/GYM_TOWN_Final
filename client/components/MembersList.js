import { useEffect, useState } from 'react';
import { fetchAll, createItem, updateItem, deleteItem } from '../utils/supabase';

function MembersList() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    membership_type: 'basic'
  });

  // Fetch all members
  useEffect(() => {
    async function loadMembers() {
      try {
        setLoading(true);
        const data = await fetchAll('members');
        setMembers(data);
        setError(null);
      } catch (err) {
        setError('Failed to load members');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadMembers();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMember(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add a new member
  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const addedMember = await createItem('members', {
        ...newMember,
        join_date: new Date().toISOString()
      });
      setMembers(prev => [...prev, addedMember]);
      setNewMember({
        name: '',
        email: '',
        phone: '',
        membership_type: 'basic'
      });
    } catch (err) {
      setError('Failed to add member');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Update member's membership type
  const handleUpdateMembership = async (id, newType) => {
    try {
      setLoading(true);
      const updatedMember = await updateItem('members', id, {
        membership_type: newType
      });
      setMembers(prev => 
        prev.map(member => member.id === id ? updatedMember : member)
      );
    } catch (err) {
      setError('Failed to update membership');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a member
  const handleDeleteMember = async (id) => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    
    try {
      setLoading(true);
      await deleteItem('members', id);
      setMembers(prev => prev.filter(member => member.id !== id));
    } catch (err) {
      setError('Failed to delete member');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && members.length === 0) return <div>Loading members...</div>;
  if (error && members.length === 0) return <div className="error">{error}</div>;

  return (
    <div className="members-container">
      <h2>Gym Members</h2>
      
      {/* Add Member Form */}
      <form onSubmit={handleAddMember} className="add-member-form">
        <h3>Add New Member</h3>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={newMember.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={newMember.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone:</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={newMember.phone}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="membership_type">Membership Type:</label>
          <select
            id="membership_type"
            name="membership_type"
            value={newMember.membership_type}
            onChange={handleInputChange}
          >
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
            <option value="vip">VIP</option>
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Member'}
        </button>
      </form>

      {/* Members List */}
      <div className="members-list">
        <h3>Current Members ({members.length})</h3>
        {members.length === 0 ? (
          <p>No members found. Add your first member!</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Membership</th>
                <th>Join Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map(member => (
                <tr key={member.id}>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td>{member.phone}</td>
                  <td>
                    <select
                      value={member.membership_type}
                      onChange={(e) => handleUpdateMembership(member.id, e.target.value)}
                      disabled={loading}
                    >
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                      <option value="vip">VIP</option>
                    </select>
                  </td>
                  <td>{new Date(member.join_date).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteMember(member.id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default MembersList; 