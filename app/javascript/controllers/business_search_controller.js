import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "useLocationBtn", 
    "locationStatus", 
    "searchBtn", 
    "latField", 
    "lngField", 
    "distanceSlider", 
    "distanceDisplay", 
    "searchForm", 
    "searchResults"
  ]

  connect() {
    // Initialize distance display
    this.updateDistanceDisplay()
  }

  updateDistanceDisplay() {
    if (this.hasDistanceDisplayTarget && this.hasDistanceSliderTarget) {
      this.distanceDisplayTarget.textContent = this.distanceSliderTarget.value
    }
  }

  useLocation() {
    if (!navigator.geolocation) {
      this.locationStatusTarget.textContent = 'Geolocation is not supported by this browser.'
      this.locationStatusTarget.className = 'location-status error'
      return
    }

    this.locationStatusTarget.textContent = 'Getting your location...'
    this.locationStatusTarget.className = 'location-status loading'
    this.useLocationBtnTarget.disabled = true

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        
        this.latFieldTarget.value = lat
        this.lngFieldTarget.value = lng
        
        this.locationStatusTarget.textContent = '✓ Location found'
        this.locationStatusTarget.className = 'location-status success'
        this.searchBtnTarget.disabled = false
        this.useLocationBtnTarget.disabled = false
      },
      (error) => {
        let errorMessage = 'Unable to get your location. '
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location access denied.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information unavailable.'
            break
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.'
            break
          default:
            errorMessage += 'Unknown error occurred.'
            break
        }
        
        this.locationStatusTarget.textContent = errorMessage
        this.locationStatusTarget.className = 'location-status error'
        this.useLocationBtnTarget.disabled = false
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }

  search(event) {
    event.preventDefault()
    
    if (!this.latFieldTarget.value || !this.lngFieldTarget.value) {
      alert('Please get your location first by clicking "Use My Location"')
      return
    }

    const formData = new FormData(this.searchFormTarget)
    const params = new URLSearchParams(formData)
    
    this.searchResultsTarget.innerHTML = '<div class="loading">Searching for businesses...</div>'
    
    fetch(`${this.searchFormTarget.action}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
    .then(response => response.json())
    .then(data => {
      this.displayResults(data)
    })
    .catch(error => {
      console.error('Error:', error)
      this.searchResultsTarget.innerHTML = '<div class="error">An error occurred while searching. Please try again.</div>'
    })
  }

  displayResults(businesses) {
    if (businesses.length === 0) {
      this.searchResultsTarget.innerHTML = '<p class="no-results">No businesses found matching your criteria.</p>'
      return
    }

    let html = `<h3>Found ${businesses.length} businesses:</h3><div class="businesses-list">`
    
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
      `
    })
    
    html += '</div>'
    this.searchResultsTarget.innerHTML = html
  }
}