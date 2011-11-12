class MonocleController < ApplicationController
  before_filter :authenticate_account!

  def index
    @events = Event.all(current_account.id)
    @sessions = Session.all(current_account.id)
    @analytics = Analytic.since(current_account.id, 5.minutes.ago)
  end
end
