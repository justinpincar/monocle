class MonocleController < ApplicationController
  before_filter :authenticate_account!

  def index
    @events = Event.all(current_account.id)
  end
end
