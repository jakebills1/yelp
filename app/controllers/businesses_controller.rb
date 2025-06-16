class BusinessesController < ApplicationController
  def index
    @businesses = Business.all

    # Filter by location if coordinates and distance are provided
    if params[:lat].present? && params[:lng].present? && params[:distance_miles].present?
      user_point = "POINT(#{params[:lng]} #{params[:lat]})"
      distance_meters = params[:distance_miles].to_f * 1609.34 # Convert miles to meters
      
      @businesses = @businesses.near(user_point, distance_meters)
    end

    # Filter by category if provided
    if params[:category].present?
      @businesses = @businesses.where(category: params[:category])
    end

    # Limit results for performance
    @businesses = @businesses.limit(params[:limit]&.to_i || 50)

    render json: @businesses.as_json(
      only: [:id, :name, :category, :address, :city, :state, :zip_code],
      methods: [:latitude, :longitude, :distance_miles]
    )
  end

  private

  def business_params
    params.permit(:lat, :lng, :distance_miles, :category, :limit)
  end
end
