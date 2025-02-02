import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBox() {
  const navigate = useNavigate();
  const [name, setName] = useState('');

  const handleSearch = (e) => {
    const query = e.target.value;
    setName(query);
    if (query.trim()) {
      navigate(`/search/name/${query}`);
    } else {
      navigate('/'); // Navigate to a default page if the input is empty
    }
  };

  return (
    <div className="search">
      <div className="row">
        <input
          type="text"
          name="q"
          id="q"
          value={name}
          onChange={handleSearch}
          placeholder="Search..."
        />
        <button className="primary" type="button" disabled>
          <i className="fa fa-search"></i>
        </button>
      </div>
    </div>
  );
}
