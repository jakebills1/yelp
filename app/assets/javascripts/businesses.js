document.addEventListener('DOMContentLoaded', function() {
  const useLocationBtn = document.getElementById('use-location-btn');
  const locationStatus = document.getElementById('location-status');
  const searchBtn = document.getElementById('search-btn');
  const latField = document.getElementById('lat');
  const lngField = document.getElementById('lng');
  const distanceSlider = document.querySelector('.range-slider');
  const distanceDisplay = document.getElementById('distance-display');
  const searchForm = document.getElementById('business-search-form');
  const searchResults = document.getElementById('search-results');

  // Update distance display when slider changes
  if (distanceSlider) {
    distanceSlider.addEventListener('input', function() {
      distanceDisplay.textContent = this.value;
    });
  }

  // Handle location button click
  if (useLocationBtn) {
    useLocationBtn.addEventListener('click', function() {
      if (!navigator.geolocation) {
        locationStatus.textContent = 'Geolocation is not supported by this browser.';
        locationStatus.className = 'location-status error';
        return;
      }

      locationStatus.textContent = 'Getting your location...';
      locationStatus.className = 'location-status loading';
      useLocationBtn.disabled = true;

      navigator.geolocation.getCurrentPosition(
        function(position) {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          latField.value = lat;
          lngField.value = lng;
          
          locationStatus.textContent = '✓ Location found';
          locationStatus.className = 'location-status success';
          searchBtn.disabled = false;
          useLocationBtn.disabled = false;
        },
        function(error) {
          let errorMessage = 'Unable to get your location. ';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Location access denied.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out.';
              break;
            default:
              errorMessage += 'Unknown error occurred.';
              break;
          }
          
          locationStatus.textContent = errorMessage;
          locationStatus.className = 'location-status error';
          useLocationBtn.disabled = false;
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Handle form submission with AJAX
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (!latField.value || !lngField.value) {
        alert('Please get your location first by clicking "Use My Location"');
        return;
      }

      const formData = new FormData(this);
      const params = new URLSearchParams(formData);
      
      searchResults.innerHTML = '<div class="loading">Searching for businesses...</div>';
      
      fetch(`${this.action}?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
      .then(response => response.json())
      .then(data => {
        displayResults(data);
      })
      .catch(error => {
        console.error('Error:', error);
        searchResults.innerHTML = '<div class="error">An error occurred while searching. Please try again.</div>';
      });
    });
  }

  function displayResults(businesses) {
    if (businesses.length === 0) {
      searchResults.innerHTML = '<p class="no-results">No businesses found matching your criteria.</p>';
      return;
    }

    let html = `<h3>Found ${businesses.length} businesses:</h3><div class="businesses-list">`;
    
    businesses.forEach(business => {
      html += `
        <div class="business-card">
          <h4>${business.name}</h4>
          <p class="category">${business.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
          <p class="address">
            ${business.address}<br>
            ${business.city}, ${business.state} ${business.zip_code}
          </p>
          ${business.distance_miles ? `<p class="distance">${business.distance_miles} miles away</p>` : ''}
        </div>
      `;
    });
    
    html += '</div>';
    searchResults.innerHTML = html;
  }
});