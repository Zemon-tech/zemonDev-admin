import React from 'react';

interface Channel {
  _id: string;
  name: string;
  type: 'text' | 'announcement' | 'readonly';
  isActive: boolean;
  permissions: {
    canMessage: boolean;
    canRead: boolean;
  };
  updatedAt: string;
  children?: Channel[];
}

interface ChannelTableProps {
  title: string;
  channels: Channel[];
}

function formatDateTime(iso: string) {
  const date = new Date(iso);
  const d = date.toLocaleDateString('en-GB'); // dd/mm/yyyy
  const t = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  return { date: d, time: t };
}

const ChannelTable: React.FC<ChannelTableProps> = ({ title, channels }) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Active</th>
              <th>Permissions</th>
              <th>Updated At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {channels.length === 0 && (
              <tr><td colSpan={6} className="text-center">No channels</td></tr>
            )}
            {channels.map((parent) => (
              <React.Fragment key={parent._id}>
                <tr className="bg-base-200 font-bold">
                  <td>{parent.name}</td>
                  <td>{parent.type}</td>
                  <td>{parent.isActive ? 'Yes' : 'No'}</td>
                  <td>
                    {parent.permissions.canMessage && <span className="badge badge-primary mr-1">Message</span>}
                    {parent.permissions.canRead && <span className="badge badge-success">Read</span>}
                  </td>
                  <td>
                    {(() => { const { date, time } = formatDateTime(parent.updatedAt); return (<><span>{date}</span><br /><span className="text-xs text-gray-500">{time}</span></>); })()}
                  </td>
                  <td>
                    <button className="btn btn-xs btn-outline btn-info mr-1">Edit</button>
                    <button className="btn btn-xs btn-outline btn-error">Delete</button>
                  </td>
                </tr>
                {parent.children && parent.children.map(child => (
                  <tr key={child._id}>
                    <td className="pl-8">{child.name}</td>
                    <td>{child.type}</td>
                    <td>{child.isActive ? 'Yes' : 'No'}</td>
                    <td>
                      {child.permissions.canMessage && <span className="badge badge-primary mr-1">Message</span>}
                      {child.permissions.canRead && <span className="badge badge-success">Read</span>}
                    </td>
                    <td>
                      {(() => { const { date, time } = formatDateTime(child.updatedAt); return (<><span>{date}</span><br /><span className="text-xs text-gray-500">{time}</span></>); })()}
                    </td>
                    <td>
                      <button className="btn btn-xs btn-outline btn-info mr-1">Edit</button>
                      <button className="btn btn-xs btn-outline btn-error">Delete</button>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChannelTable; 