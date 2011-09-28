class ApplicationController < ActionController::Base
  protect_from_forgery

  private

  def authenticate_account!
    true
  end
end
