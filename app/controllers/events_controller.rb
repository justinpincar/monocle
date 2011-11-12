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
    redirect_to event_path(event._id)
  end

  def show
    @event = Event.find(current_account.id, params[:id])
  end

  def update
    event_params = params[:event]

    event = Event.find(current_account.id, event_params[:_id])

    event.update(event_params)
    event.save(current_account.id)
    redirect_to event_path(event._id)
  end

  def destroy
    @event = Event.find(current_account.id, params[:id])
    @event.destroy(current_account.id)

    redirect_to events_path
  end
end
