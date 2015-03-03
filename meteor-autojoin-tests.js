Tinytest.add('AutoJoin._private.CreateFindOption Tests', function (test) {
  test.equal(AutoJoin._private.createFindOption(), {});
  test.equal(AutoJoin._private.createFindOption(true), {
    autojoin: {
      join: true
    }
  });
  test.equal(AutoJoin._private.createFindOption(false), {
    autojoin: {
      join: false
    }
  });
  test.equal(AutoJoin._private.createFindOption(undefined, 3), {
    autojoin: {
      depth: 3
    }
  });
  test.equal(AutoJoin._private.createFindOption(undefined, 5), {
    autojoin: {
      depth: 5
    }
  });
  test.equal(AutoJoin._private.createFindOption(true, 1), {
    autojoin: {
      join: true,
      depth: 1
    }
  });
  test.equal(AutoJoin._private.createFindOption(false, 0), {
    autojoin: {
      join: false,
      depth: 0
    }
  });
});

Tinytest.add('Basic Test', function (test) {
  AutoJoin.prefs.automatic = true;
  AutoJoin.prefs.depth = 1;

  //setup
  var Children = new Mongo.Collection('children');
  var ChildSchema = new SimpleSchema({
    name: {
      type: String,
      label: "Name"
    }
  });
  Children.attachSchema(ChildSchema);
  Children.allow({insert: function(){return true}, update: function(){return true}, remove: function(){return true}});


  var Parents = new Mongo.Collection("parents");
  var ParentSchema = new SimpleSchema({
    name: {
      type: String,
      label: 'Name'
    },
    child: {
      type: String,
      label: 'Child',
      autojoin: {
        collection: 'Children', //references the Children global variable
        id: '_id' //(optional) the id of the target(i.e. Children) collection
      }
    }
  });
  Parents.attachSchema(ParentSchema);
  Parents.allow({insert: function(){return true}, update: function(){return true}, remove: function(){return true}});

  //delete old passes
  Children.find({}).fetch().forEach(function(o,i,c){
    Children.remove({_id:o._id});
  });
  Parents.find({}).fetch().forEach(function(o,i,c){
    Parents.remove({_id: o._id});
  })

  //create new documents
  var cid = Children.insert({
    name: 'child'
  });
  Parents.insert({
    name: 'parent',
    child: cid
  });

  //test

  var allParents = Parents.find({});
  test.equal(allParents.count(), 1);
  test.equal(_.omit(allParents.fetch()[0], '_id'), {
    name: 'parent',
    child: {
      name: 'child'
    }
  });
});