class Event::UrlEvent < Event
  attr_accessor :pattern

  def self.build(params={})
    event = super(Event::UrlEvent.new, params)

    event_params = params[:event]
    event.pattern = event_params[:pattern]

    event
  end

  def save(account_id)
    super(account_id)
    @@db.collection("events_#{account_id}").update({_id: _id}, {"$set" => {pattern: pattern}})
  end
end
