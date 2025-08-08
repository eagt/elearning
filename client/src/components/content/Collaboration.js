import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  createCollaboration,
  getCollaborations,
  getCollaboration,
  updateCollaboration,
  deleteCollaboration,
  addMember,
  acceptInvitation,
  declineInvitation,
  removeMember,
  addComment,
  addReply,
  resolveComment,
  addTask,
  updateTask,
  createVersion
} from '../../actions/collaboration';
import { setAlert } from '../../actions/alert';
import { getUsers } from '../../actions/user';
import Modal from '../layout/Modal';
import Spinner from '../layout/Spinner';

const Collaboration = ({
  auth,
  collaboration,
  createCollaboration,
  getCollaborations,
  getCollaboration,
  updateCollaboration,
  deleteCollaboration,
  addMember,
  acceptInvitation,
  declineInvitation,
  removeMember,
  addComment,
  addReply,
  resolveComment,
  addTask,
  updateTask,
  createVersion,
  setAlert,
  getUsers,
  users,
  content,
  contentType,
  history,
  isOpen,
  onClose
}) => {
  const [formData, setFormData] = useState({
    status: 'active',
    settings: {
      allowInvites: true,
      requireApproval: false,
      autoAccept: false,
      notifyOnChanges: true,
      allowComments: true,
      allowVersionHistory: true
    }
  });

  const [activeTab, setActiveTab] = useState('create');
  const [selectedCollaboration, setSelectedCollaboration] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: ''
  });
  const [versionForm, setVersionForm] = useState({
    changes: '',
    snapshot: ''
  });
  const [memberForm, setMemberForm] = useState({
    userId: '',
    role: 'commenter',
    permissions: {
      canEdit: false,
      canComment: true,
      canInvite: false,
      canDelete: false
    }
  });

  const {
    status,
    settings
  } = formData;

  useEffect(() => {
    if (isOpen && content) {
      getCollaborations();
      getUsers();
    }
  }, [isOpen, content, getCollaborations, getUsers]);

  useEffect(() => {
    if (selectedCollaboration) {
      getCollaboration(selectedCollaboration._id);
    }
  }, [selectedCollaboration, getCollaboration]);

  const onChange = e => {
    if (e.target.name.includes('.')) {
      const [parent, child] = e.target.name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
        }
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const onTaskChange = e => {
    if (e.target.name.includes('.')) {
      const [parent, child] = e.target.name.split('.');
      setTaskForm({
        ...taskForm,
        [parent]: {
          ...taskForm[parent],
          [child]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
        }
      });
    } else {
      setTaskForm({ ...taskForm, [e.target.name]: e.target.value });
    }
  };

  const onVersionChange = e => {
    setVersionForm({ ...versionForm, [e.target.name]: e.target.value });
  };

  const onMemberChange = e => {
    if (e.target.name.includes('.')) {
      const [parent, child] = e.target.name.split('.');
      setMemberForm({
        ...memberForm,
        [parent]: {
          ...memberForm[parent],
          [child]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
        }
      });
    } else {
      setMemberForm({ ...memberForm, [e.target.name]: e.target.value });
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    const collaborationData = {
      contentId: content._id,
      contentType,
      settings
    };

    try {
      const newCollaboration = await createCollaboration(collaborationData);
      setAlert('Collaboration created successfully', 'success');
      getCollaborations();
      setSelectedCollaboration(newCollaboration);
      setActiveTab('manage');
    } catch (err) {
      setAlert('Error creating collaboration', 'danger');
    }
  };

  const handleUpdateCollaboration = async () => {
    if (!selectedCollaboration) return;
    
    const collaborationData = {
      status,
      settings
    };

    try {
      await updateCollaboration(selectedCollaboration._id, collaborationData);
      setAlert('Collaboration updated successfully', 'success');
      getCollaboration(selectedCollaboration._id);
    } catch (err) {
      setAlert('Error updating collaboration', 'danger');
    }
  };

  const handleDeleteCollaboration = async collaborationId => {
    if (window.confirm('Are you sure you want to delete this collaboration? This action cannot be undone.')) {
      try {
        await deleteCollaboration(collaborationId);
        setAlert('Collaboration deleted successfully', 'success');
        getCollaborations();
        setSelectedCollaboration(null);
      } catch (err) {
        setAlert('Error deleting collaboration', 'danger');
      }
    }
  };

  const handleSelectCollaboration = collaboration => {
    setSelectedCollaboration(collaboration);
    setFormData({
      status: collaboration.status,
      settings: collaboration.settings
    });
    setActiveTab('manage');
  };

  const handleAddMember = async () => {
    if (!selectedCollaboration || !memberForm.userId) return;
    
    try {
      await addMember(selectedCollaboration._id, memberForm);
      setAlert('Member added successfully', 'success');
      getCollaboration(selectedCollaboration._id);
      setMemberForm({
        userId: '',
        role: 'commenter',
        permissions: {
          canEdit: false,
          canComment: true,
          canInvite: false,
          canDelete: false
        }
      });
    } catch (err) {
      setAlert('Error adding member', 'danger');
    }
  };

  const handleAcceptInvitation = async collaborationId => {
    try {
      await acceptInvitation(collaborationId, auth.user._id);
      setAlert('Invitation accepted', 'success');
      getCollaborations();
    } catch (err) {
      setAlert('Error accepting invitation', 'danger');
    }
  };

  const handleDeclineInvitation = async collaborationId => {
    try {
      await declineInvitation(collaborationId, auth.user._id);
      setAlert('Invitation declined', 'success');
      getCollaborations();
    } catch (err) {
      setAlert('Error declining invitation', 'danger');
    }
  };

  const handleRemoveMember = async userId => {
    if (!selectedCollaboration) return;
    
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await removeMember(selectedCollaboration._id, userId);
        setAlert('Member removed successfully', 'success');
        getCollaboration(selectedCollaboration._id);
      } catch (err) {
        setAlert('Error removing member', 'danger');
      }
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedCollaboration) return;
    
    try {
      await addComment(selectedCollaboration._id, newComment);
      setAlert('Comment added successfully', 'success');
      setNewComment('');
      getCollaboration(selectedCollaboration._id);
    } catch (err) {
      setAlert('Error adding comment', 'danger');
    }
  };

  const handleAddReply = async commentIndex => {
    if (!replyText.trim() || !selectedCollaboration) return;
    
    try {
      await addReply(selectedCollaboration._id, commentIndex, replyText);
      setAlert('Reply added successfully', 'success');
      setReplyText('');
      setReplyingTo(null);
      getCollaboration(selectedCollaboration._id);
    } catch (err) {
      setAlert('Error adding reply', 'danger');
    }
  };

  const handleResolveComment = async commentIndex => {
    if (!selectedCollaboration) return;
    
    try {
      await resolveComment(selectedCollaboration._id, commentIndex);
      setAlert('Comment resolved', 'success');
      getCollaboration(selectedCollaboration._id);
    } catch (err) {
      setAlert('Error resolving comment', 'danger');
    }
  };

  const handleAddTask = async () => {
    if (!taskForm.title || !taskForm.assignedTo || !selectedCollaboration) return;
    
    try {
      await addTask(
        selectedCollaboration._id,
        taskForm.title,
        taskForm.description,
        taskForm.assignedTo,
        auth.user._id,
        taskForm.priority,
        taskForm.dueDate ? new Date(taskForm.dueDate) : null
      );
      setAlert('Task added successfully', 'success');
      getCollaboration(selectedCollaboration._id);
      setTaskForm({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        dueDate: ''
      });
    } catch (err) {
      setAlert('Error adding task', 'danger');
    }
  };

  const handleUpdateTask = async (taskIndex, updates) => {
    if (!selectedCollaboration) return;
    
    try {
      await updateTask(selectedCollaboration._id, taskIndex, updates);
      setAlert('Task updated successfully', 'success');
      getCollaboration(selectedCollaboration._id);
    } catch (err) {
      setAlert('Error updating task', 'danger');
    }
  };

  const handleCreateVersion = async () => {
    if (!versionForm.changes || !versionForm.snapshot || !selectedCollaboration) return;
    
    try {
      await createVersion(
        selectedCollaboration._id,
        versionForm.changes,
        JSON.parse(versionForm.snapshot)
      );
      setAlert('Version created successfully', 'success');
      getCollaboration(selectedCollaboration._id);
      setVersionForm({
        changes: '',
        snapshot: ''
      });
    } catch (err) {
      setAlert('Error creating version', 'danger');
    }
  };

  const renderCreateCollaboration = () => (
    <div className="collaboration-create">
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Collaboration Settings</label>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="allowInvites"
              name="settings.allowInvites"
              checked={settings.allowInvites}
              onChange={onChange}
            />
            <label className="form-check-label" htmlFor="allowInvites">
              Allow Invites
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="requireApproval"
              name="settings.requireApproval"
              checked={settings.requireApproval}
              onChange={onChange}
            />
            <label className="form-check-label" htmlFor="requireApproval">
              Require Approval
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="autoAccept"
              name="settings.autoAccept"
              checked={settings.autoAccept}
              onChange={onChange}
            />
            <label className="form-check-label" htmlFor="autoAccept">
              Auto Accept Invitations
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="notifyOnChanges"
              name="settings.notifyOnChanges"
              checked={settings.notifyOnChanges}
              onChange={onChange}
            />
            <label className="form-check-label" htmlFor="notifyOnChanges">
              Notify on Changes
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="allowComments"
              name="settings.allowComments"
              checked={settings.allowComments}
              onChange={onChange}
            />
            <label className="form-check-label" htmlFor="allowComments">
              Allow Comments
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="allowVersionHistory"
              name="settings.allowVersionHistory"
              checked={settings.allowVersionHistory}
              onChange={onChange}
            />
            <label className="form-check-label" htmlFor="allowVersionHistory">
              Allow Version History
            </label>
          </div>
        </div>

        <div className="form-group">
          <button type="submit" className="btn btn-primary">
            Create Collaboration
          </button>
        </div>
      </form>
    </div>
  );

  const renderManageCollaboration = () => (
    <div className="collaboration-manage">
      {collaboration.loading ? (
        <Spinner />
      ) : (
        <>
          <div className="mb-4">
            <h5>Your Collaborations</h5>
            {collaboration.collaborations && collaboration.collaborations.length > 0 ? (
              <div className="list-group">
                {collaboration.collaborations.map(collab => (
                  <div key={collab._id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">
                          {collab.contentId.title} - Collaboration
                        </h6>
                        <small className="text-muted">
                          Created on {new Date(collab.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                      <div>
                        <span className={`badge ${collab.status === 'active' ? 'badge-success' : 'badge-secondary'} mr-2`}>
                          {collab.status}
                        </span>
                        <button
                          className="btn btn-sm btn-outline-primary mr-1"
                          onClick={() => handleSelectCollaboration(collab)}
                        >
                          Manage
                        </button>
                        {collab.isOwner(auth.user._id) && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteCollaboration(collab._id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <small className="text-muted">
                        Members: {collab.members.filter(m => m.status === 'accepted').length} | 
                        Tasks: {collab.tasks.length} | 
                        Comments: {collab.comments.length}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No collaborations found</p>
            )}
          </div>
          
          {selectedCollaboration && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Manage Collaboration</h5>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    className="form-control"
                    id="status"
                    name="status"
                    value={status}
                    onChange={onChange}
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Settings</label>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="allowInvites"
                      name="settings.allowInvites"
                      checked={settings.allowInvites}
                      onChange={onChange}
                    />
                    <label className="form-check-label" htmlFor="allowInvites">
                      Allow Invites
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="requireApproval"
                      name="settings.requireApproval"
                      checked={settings.requireApproval}
                      onChange={onChange}
                    />
                    <label className="form-check-label" htmlFor="requireApproval">
                      Require Approval
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="autoAccept"
                      name="settings.autoAccept"
                      checked={settings.autoAccept}
                      onChange={onChange}
                    />
                    <label className="form-check-label" htmlFor="autoAccept">
                      Auto Accept Invitations
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="notifyOnChanges"
                      name="settings.notifyOnChanges"
                      checked={settings.notifyOnChanges}
                      onChange={onChange}
                    />
                    <label className="form-check-label" htmlFor="notifyOnChanges">
                      Notify on Changes
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="allowComments"
                      name="settings.allowComments"
                      checked={settings.allowComments}
                      onChange={onChange}
                    />
                    <label className="form-check-label" htmlFor="allowComments">
                      Allow Comments
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="allowVersionHistory"
                      name="settings.allowVersionHistory"
                      checked={settings.allowVersionHistory}
                      onChange={onChange}
                    />
                    <label className="form-check-label" htmlFor="allowVersionHistory">
                      Allow Version History
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <button
                    type="button"
                    className="btn btn-primary mr-2"
                    onClick={handleUpdateCollaboration}
                  >
                    Update Collaboration
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setSelectedCollaboration(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderMembers = () => (
    <div className="collaboration-members">
      {selectedCollaboration ? (
        <>
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Add Member</h5>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label htmlFor="userId">User</label>
                <select
                  className="form-control"
                  id="userId"
                  name="userId"
                  value={memberForm.userId}
                  onChange={onMemberChange}
                >
                  <option value="">Select a user</option>
                  {users.users && users.users
                    .filter(user => 
                      user._id !== auth.user._id && 
                      !selectedCollaboration.members.some(m => m.userId._id === user._id)
                    )
                    .map(user => (
                      <option key={user._id} value={user._id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  className="form-control"
                  id="role"
                  name="role"
                  value={memberForm.role}
                  onChange={onMemberChange}
                >
                  <option value="editor">Editor</option>
                  <option value="reviewer">Reviewer</option>
                  <option value="commenter">Commenter</option>
                </select>
              </div>

              <div className="form-group">
                <label>Permissions</label>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="canEdit"
                    name="permissions.canEdit"
                    checked={memberForm.permissions.canEdit}
                    onChange={onMemberChange}
                  />
                  <label className="form-check-label" htmlFor="canEdit">
                    Can Edit
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="canComment"
                    name="permissions.canComment"
                    checked={memberForm.permissions.canComment}
                    onChange={onMemberChange}
                  />
                  <label className="form-check-label" htmlFor="canComment">
                    Can Comment
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="canInvite"
                    name="permissions.canInvite"
                    checked={memberForm.permissions.canInvite}
                    onChange={onMemberChange}
                  />
                  <label className="form-check-label" htmlFor="canInvite">
                    Can Invite
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="canDelete"
                    name="permissions.canDelete"
                    checked={memberForm.permissions.canDelete}
                    onChange={onMemberChange}
                  />
                  <label className="form-check-label" htmlFor="canDelete">
                    Can Delete
                  </label>
                </div>
              </div>

              <div className="form-group">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddMember}
                  disabled={!memberForm.userId}
                >
                  Add Member
                </button>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Current Members</h5>
            </div>
            <div className="card-body">
              {selectedCollaboration.members && selectedCollaboration.members.length > 0 ? (
                <div className="list-group">
                  {selectedCollaboration.members.map((member, index) => (
                    <div key={index} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">
                            {member.userId.firstName} {member.userId.lastName}
                          </h6>
                          <small className="text-muted">
                            {member.role} | {member.status}
                          </small>
                        </div>
                        <div>
                          {member.status === 'invited' && member.userId._id === auth.user._id && (
                            <>
                              <button
                                className="btn btn-sm btn-outline-success mr-1"
                                onClick={() => handleAcceptInvitation(selectedCollaboration._id)}
                              >
                                Accept
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeclineInvitation(selectedCollaboration._id)}
                              >
                                Decline
                              </button>
                            </>
                          )}
                          {selectedCollaboration.isOwner(auth.user._id) && member.userId._id !== auth.user._id && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleRemoveMember(member.userId._id)}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No members found</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-5">
          <p className="text-muted">Select a collaboration to manage members</p>
        </div>
      )}
    </div>
  );

  const renderTasks = () => (
    <div className="collaboration-tasks">
      {selectedCollaboration ? (
        <>
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Add Task</h5>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label htmlFor="title">Task Title</label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  name="title"
                  value={taskForm.title}
                  onChange={onTaskChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  value={taskForm.description}
                  onChange={onTaskChange}
                  rows="3"
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="assignedTo">Assigned To</label>
                <select
                  className="form-control"
                  id="assignedTo"
                  name="assignedTo"
                  value={taskForm.assignedTo}
                  onChange={onTaskChange}
                >
                  <option value="">Select a member</option>
                  {selectedCollaboration.members
                    .filter(m => m.status === 'accepted')
                    .map(member => (
                      <option key={member.userId._id} value={member.userId._id}>
                        {member.userId.firstName} {member.userId.lastName}
                      </option>
                    ))}
                  <option value={selectedCollaboration.ownerId._id}>
                    {selectedCollaboration.ownerId.firstName} {selectedCollaboration.ownerId.lastName} (Owner)
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  className="form-control"
                  id="priority"
                  name="priority"
                  value={taskForm.priority}
                  onChange={onTaskChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="dueDate">Due Date</label>
                <input
                  type="date"
                  className="form-control"
                  id="dueDate"
                  name="dueDate"
                  value={taskForm.dueDate}
                  onChange={onTaskChange}
                />
              </div>

              <div className="form-group">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddTask}
                  disabled={!taskForm.title || !taskForm.assignedTo}
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Tasks</h5>
            </div>
            <div className="card-body">
              {selectedCollaboration.tasks && selectedCollaboration.tasks.length > 0 ? (
                <div className="list-group">
                  {selectedCollaboration.tasks.map((task, index) => (
                    <div key={index} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{task.title}</h6>
                          <small className="text-muted">
                            Assigned to: {task.assignedTo.firstName} {task.assignedTo.lastName} | 
                            Priority: {task.priority} | 
                            Status: {task.status}
                          </small>
                          {task.dueDate && (
                            <div>
                              <small className="text-muted">
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </small>
                            </div>
                          )}
                        </div>
                        <div>
                          <select
                            className="form-control form-control-sm"
                            value={task.status}
                            onChange={e => handleUpdateTask(index, { status: e.target.value })}
                            disabled={
                              task.assignedTo._id !== auth.user._id && 
                              !selectedCollaboration.isOwner(auth.user._id)
                            }
                          >
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No tasks found</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-5">
          <p className="text-muted">Select a collaboration to manage tasks</p>
        </div>
      )}
    </div>
  );

  const renderVersions = () => (
    <div className="collaboration-versions">
      {selectedCollaboration ? (
        <>
          {selectedCollaboration.isOwner(auth.user._id) && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Create Version</h5>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label htmlFor="changes">Changes Description</label>
                  <textarea
                    className="form-control"
                    id="changes"
                    name="changes"
                    value={versionForm.changes}
                    onChange={onVersionChange}
                    rows="3"
                  ></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="snapshot">Content Snapshot (JSON)</label>
                  <textarea
                    className="form-control"
                    id="snapshot"
                    name="snapshot"
                    value={versionForm.snapshot}
                    onChange={onVersionChange}
                    rows="5"
                    placeholder='{"title": "Content Title", "description": "Content Description", ...}'
                  ></textarea>
                  <small className="form-text text-muted">
                    This should be a JSON representation of the current state of the content
                  </small>
                </div>

                <div className="form-group">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleCreateVersion}
                    disabled={!versionForm.changes || !versionForm.snapshot}
                  >
                    Create Version
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Version History</h5>
            </div>
            <div className="card-body">
              {selectedCollaboration.versions && selectedCollaboration.versions.length > 0 ? (
                <div className="list-group">
                  {selectedCollaboration.versions
                    .sort((a, b) => b.versionNumber - a.versionNumber)
                    .map((version, index) => (
                      <div key={index} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-1">
                              Version {version.versionNumber}
                              {version.isCurrent && (
                                <span className="badge badge-success ml-2">Current</span>
                              )}
                            </h6>
                            <small className="text-muted">
                              Created by {version.userId.firstName} {version.userId.lastName} on {new Date(version.timestamp).toLocaleDateString()}
                            </small>
                          </div>
                          <div>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => {
                                setVersionForm({
                                  ...versionForm,
                                  snapshot: JSON.stringify(version.snapshot, null, 2)
                                });
                              }}
                            >
                              View Snapshot
                            </button>
                          </div>
                        </div>
                        <p className="mt-2">{version.changes}</p>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-muted">No versions found</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-5">
          <p className="text-muted">Select a collaboration to view version history</p>
        </div>
      )}
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Collaboration" size="lg">
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            Create
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            Manage
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            Members
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            Tasks
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'versions' ? 'active' : ''}`}
            onClick={() => setActiveTab('versions')}
          >
            Versions
          </button>
        </li>
      </ul>

      <div className="tab-content">
        {activeTab === 'create' && renderCreateCollaboration()}
        {activeTab === 'manage' && renderManageCollaboration()}
        {activeTab === 'members' && renderMembers()}
        {activeTab === 'tasks' && renderTasks()}
        {activeTab === 'versions' && renderVersions()}
      </div>
    </Modal>
  );
};

Collaboration.propTypes = {
  auth: PropTypes.object.isRequired,
  collaboration: PropTypes.object.isRequired,
  createCollaboration: PropTypes.func.isRequired,
  getCollaborations: PropTypes.func.isRequired,
  getCollaboration: PropTypes.func.isRequired,
  updateCollaboration: PropTypes.func.isRequired,
  deleteCollaboration: PropTypes.func.isRequired,
  addMember: PropTypes.func.isRequired,
  acceptInvitation: PropTypes.func.isRequired,
  declineInvitation: PropTypes.func.isRequired,
  removeMember: PropTypes.func.isRequired,
  addComment: PropTypes.func.isRequired,
  addReply: PropTypes.func.isRequired,
  resolveComment: PropTypes.func.isRequired,
  addTask: PropTypes.func.isRequired,
  updateTask: PropTypes.func.isRequired,
  createVersion: PropTypes.func.isRequired,
  setAlert: PropTypes.func.isRequired,
  getUsers: PropTypes.func.isRequired,
  users: PropTypes.object.isRequired,
  content: PropTypes.object.isRequired,
  contentType: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  collaboration: state.collaboration,
  users: state.users
});

export default connect(mapStateToProps, {
  createCollaboration,
  getCollaborations,
  getCollaboration,
  updateCollaboration,
  deleteCollaboration,
  addMember,
  acceptInvitation,
  declineInvitation,
  removeMember,
  addComment,
  addReply,
  resolveComment,
  addTask,
  updateTask,
  createVersion,
  setAlert,
  getUsers
})(withRouter(Collaboration));