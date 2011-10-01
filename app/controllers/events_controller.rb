class EventsController < ApplicationController
  before_filter :authenticate_account!

  def index
    @events = Event.all(current_account.id)
  end

  def create
    event_params = params[:event]
    type = event_params[:type].to_i

    case type
      when 0
        event = Event::UrlEvent.build(params)
      else
        raise "Unknown event type: #{type}"
    end

    event.save(current_account.id)
    redirect_to event_path(event)
  end

  def show
    @event = Event.find(current_account.id, params[:id])
  end
end
