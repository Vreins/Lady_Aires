import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { saveShippingAddress } from '../actions/cartActions';
import CheckoutSteps from '../components/CheckoutSteps';
import Axios from 'axios';

const countryStateLocationData = [
  {
    country: 'USA',
    states: [
      { state: 'California', locations: ['Los Angeles', 'San Francisco', 'San Diego'] },
      { state: 'Texas', locations: ['Houston', 'Dallas', 'Austin'] },
    ],
  },
  {
    country: 'Canada',
    states: [
      { state: 'Ontario', locations: ['Toronto', 'Ottawa', 'Mississauga'] },
      { state: 'Quebec', locations: ['Montreal', 'Quebec City', 'Gatineau'] },
    ],
  },
  {
    country: 'Mexico',
    states: [
      { state: 'Jalisco', locations: ['Guadalajara', 'Puerto Vallarta', 'Tlaquepaque'] },
      { state: 'CDMX', locations: ['Mexico City', 'Xochimilco', 'Coyoacán'] },
    ],
  },
];

export default function ShippingAddressScreen() {
  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  const [fullName, setFullName] = useState(shippingAddress.fullName || '');
  const [address, setAddress] = useState(shippingAddress.address || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
  const [country, setCountry] = useState(shippingAddress.country || '');
  const [state, setState] = useState(shippingAddress.state || '');
  const [location, setLocation] = useState(shippingAddress.location || '');

  const [states, setStates] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    if (!userInfo) {
      navigate('/signin');
    } else {
      Axios.get(`/api/users/list?email=${userInfo.email}`)
        .then((response) => setSavedAddresses(response.data))
        .catch((error) => alert(error.response?.data?.message || 'Error fetching saved addresses'));
    }
  }, [navigate, userInfo]);

  const handleSelectAddress = (index) => {
    const selectedAddress = savedAddresses[index];
    setFullName(selectedAddress.fullName);
    setAddress(selectedAddress.address);
    setCity(selectedAddress.city);
    setPostalCode(selectedAddress.postalCode);
    setCountry(selectedAddress.country);
    setState(selectedAddress.state);
    setLocation(selectedAddress.location);
    setSelectedAddressIndex(index);
    setShowNewAddressForm(false); // Hide input fields when a saved address is selected
  };

  const toggleNewAddressForm = () => {
    setShowNewAddressForm(true);
    setSelectedAddressIndex(null); // Deselect any saved address
    setFullName('');
    setAddress('');
    setCity('');
    setPostalCode('');
    setCountry('');
    setState('');
    setLocation('');
  };

  const handleDeleteAddress = async (index) => {
    const addressToDelete = savedAddresses[index];
    try {
      // Send the address and email to the backend for deletion
      await Axios.delete('/api/users/address', {
        data: { 
          ...addressToDelete,  // Send full address data
          email: userInfo.email // Include the user's email
        }
      });
      // Update UI after successful deletion
      setSavedAddresses(savedAddresses.filter((_, i) => i !== index));
      alert('Address deleted successfully');
    } catch (error) {
      alert('Error deleting address');
    }
  };
  
  
  const handleSaveShippingAddress = async () => {
    try {
      const addressData = {
        fullName,
        address,
        city,
        postalCode,
        country,
        state,
        location,
        email: userInfo.email,
      };

      const { data } = await Axios.post('/api/users/save', addressData);
      alert(data.message);

      setSavedAddresses([...savedAddresses, addressData]);
      setShowNewAddressForm(false);
    } catch (error) {
      alert('Error saving shipping address');
    }
  };

  const handleContinue = (e) => {
    e.preventDefault();
    dispatch(saveShippingAddress({ fullName, address, city, postalCode, country, state, location }));
    navigate('/payment');
  };

  const handleCountryChange = (selectedCountry) => {
    setCountry(selectedCountry);
    setState(''); // Reset state
    setLocation(''); // Reset location
    setStates([]); // Clear states array initially
    setLocations([]); // Clear locations array initially
  
    const countryData = countryStateLocationData.find((c) => c.country === selectedCountry);
    if (countryData) {
      setStates(countryData.states); // Populate states for the selected country
    }
  };
  
  const handleStateChange = (selectedState) => {
    setState(selectedState);
    setLocation(''); // Reset location
    setLocations([]); // Clear locations array initially
  
    const stateData = states.find((s) => s.state === selectedState);
    if (stateData) {
      setLocations(stateData.locations); // Populate locations for the selected state
    }
  };
  
  const isFormValid = () => {
    if (showNewAddressForm) {
      return (
        fullName &&
        address &&
        city &&
        postalCode &&
        country &&
        state &&
        location
      );
    }
    return selectedAddressIndex !== null; // Valid if a saved address is selected
  };

  return (
    <div>
      <CheckoutSteps step1 step2></CheckoutSteps>
      <form className="form" onSubmit={handleContinue}>
        <div>
          <h1>Shipping Address</h1>
        </div>

        {savedAddresses.length > 0 && (
          <div>
            <h3>Saved Addresses</h3>
            <ul>
              {savedAddresses.map((address, index) => (
                <li key={index}>
                  <button
                    type="button"
                    className={selectedAddressIndex === index ? 'selected' : ''}
                    onClick={() => handleSelectAddress(index)}
                  >
                    {address.fullName}, {address.state}, {address.location}
                  </button>
                  <button
  type="button"
  onClick={() => {
    const confirmDelete = window.confirm("Do you want to delete this address?");
    if (confirmDelete) {
      handleDeleteAddress(index);
    }
  }}
>
  Delete
</button>
                </li>
              ))}
            </ul>
            <button type="button" className="secondary" onClick={toggleNewAddressForm}>
              Enter New Address
            </button>
          </div>
        )}

        {(showNewAddressForm || savedAddresses.length === 0) && (
          <>
            <div>
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                placeholder="Enter full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                placeholder="Enter address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                placeholder="Enter city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="postalCode">Postal Code</label>
              <input
                type="text"
                id="postalCode"
                placeholder="Enter postal code"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="country">Country</label>
              <select
                id="country"
                value={country}
                onChange={(e) => handleCountryChange(e.target.value)}
                required
              >
                <option value="">Select Country</option>
                {countryStateLocationData.map((c) => (
                  <option key={c.country} value={c.country}>
                    {c.country}
                  </option>
                ))}
              </select>

            </div>
            <div>
              <label htmlFor="state">State</label>
              <select
                id="state"
                value={state}
                onChange={(e) => handleStateChange(e.target.value)}
                disabled={!country}
                required
              >
                <option value="">Select State</option>
                {states.map((s) => (
                  <option key={s.state} value={s.state}>
                    {s.state}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="location">Location</label>
              <select
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={!state}
              required
            >
              <option value="">Select Location</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            </div>
            <div>
              <button
                type="button"
                className="primary"
                onClick={handleSaveShippingAddress}
              >
                Save Shipping Address
              </button>
            </div>
          </>
        )}

        <div>
          <button className="primary" type="submit" disabled={!isFormValid()}>
  Continue
</button>
        </div>
      </form>
    </div>
  );
}