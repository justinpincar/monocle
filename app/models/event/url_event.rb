class Event::UrlEvent < Event
  attr_accessor :pattern

  def pattern_js
    return nil if (pattern.nil? or pattern.empty?)

    pattern.gsub!('/', '\/');
    pattern.gsub!('.', '\.');
    pattern.gsub!('*', '.*');
    "^#{pattern}$"
  end

  def self.build(params={})
    event = super(Event::UrlEvent.new, params)

    event_params = params["event"]
    event.pattern = event_params["pattern"] if event_params["pattern"].present?

    event
  end

  def update(params={})
    super(params)
    self.pattern = params[:pattern] if params[:pattern].present?
  end

  def save(account_id)
    if pattern.nil? or pattern.empty?
      raise "Pattern is required!"
    end

    super(account_id)
    @@db.collection("events_#{account_id}").update({_id: _id}, {"$set" => {pattern: pattern}})
  end
end
