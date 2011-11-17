class Funnel
  attr_accessor :_id, :name, :e_ids, :c_at, :u_at

  def self.build(params)
    funnel = Funnel.new

    funnel._id = params["_id"] if params["_id"].present?
    funnel.name = params["name"] if params["name"].present?

    e_ids = []
    if params["e_ids"].present?
      params["e_ids"].each do |e_id|
        e_id = BSON::ObjectId.from_string(e_id) if e_id.is_a?(String)
        e_ids.push(e_id)
      end
    end
    funnel.e_ids = e_ids

    funnel.c_at = params["c_at"] if params["c_at"].present?
    funnel.u_at = params["u_at"] if params["u_at"].present?
    funnel
  end

  def update(params={})
    self.name = params["name"] if params["name"].present?

    if params["e_ids"].present?
      e_ids = []
      params["e_ids"].each do |e_id|
        e_id = BSON::ObjectId.from_string(e_id) if e_id.is_a?(String)
        e_ids.push(e_id)
      end
      self.e_ids = e_ids
    end
  end

  def save(account_id)
    now = Time.now

    if self._id.nil?
      self._id = BSON::ObjectId.new
      @@db.collection("funnels_#{account_id}").insert({_id: _id, name: name, e_ids: e_ids, c_at: now, u_at: now})
    else
      @@db.collection("funnels_#{account_id}").update({_id: _id}, {"$set" => {name: name, e_ids: e_ids, u_at: now}})
    end
  end

  def destroy(account_id)
    @@db.collection("funnels_#{account_id}").remove({_id: self._id})
  end

  def self.all(account_id)
    funnels = []

    funnels_params = @@db.collection("funnels_#{account_id}").find()
    funnels_params.each do |params|
      funnel = generate(params)
      funnels.push(funnel)
    end

    funnels
  end

  def events(account_id)
    events = []
    if e_ids.present?
      e_ids.each do |e_id|
        event = Event.find(account_id, e_id)
        events.push(event)
      end
    end

    events
  end

  @funnels = {}

  def self.find(account_id, id)
    begin
      id = BSON::ObjectId.from_string(id) if id.is_a?(String)
    rescue
      id = nil
    end

    if id.present?
      @funnels[id] ||= generate(@@db.collection("funnels_#{account_id}").find({_id: id}).first)
    end
  end

  private

  def self.generate(params)
    Funnel.build(params)
  end
end
