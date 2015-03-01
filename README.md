AutoJoin
=============

A simple join mechanism for meteor and SimpleSchema.

- [Installation](#installation)
- [Basic Usage](#basicUsage)
- [Advanced Usage](#advancedUsage)
- [Notes](#notes)

## Instalation
In your meteor app directory, enter:

```
meteor add dpankros:autojoin
```

## Basic Usage
AutoJoin exposes a global AutoJoin object that mainly exposes default
preferences.  You need to define a SimpleSchema for your data and add an
autojoin property object to it.  For
example:

```
Children = new Mongo.Collection("children");

ChildSchema = new SimpleSchema({
  name: {
    type: String,
    label: "Name",
  }
});

Children.attachSchema(ChildSchema);


Parents = new Mongo.Collection("parents");

ParentSchema = new SimpleSchema({
  name: {
    type: String,
    label: "Name",
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
```

Then you just fetch your data as you normally would

```
var allParents = Parents.find({});
```

And the parents will have their child property replaced with the value of the
 corresponding child object.

## Advanced Usage
AutoJoin has basic configuration capabilities.  These are done be setting
properties in the AutoJoin.prefs object.  E.g.:
```
//Don't join unless we tell you to
AutoJoin.prefs.joinWhenSpecified = false;

//Recurse up to four levels deep
AutoJoin.prefs.joinDepth = 4;
```

Additionally, these options can be set on a case-by-case basis by specifying
options to Collection.Find or Collection.FindOne.  For example:

```
//don't perform a join at all, regardless of the default depth
Parents.find({}, {autojoin:{automatic:false}});

//if we join, only recurse one level deep.  If joinWhenSpecified is false, no
 join will be performed regardless of depth
Parents.find({}, {autojoin:{depth:1}};

//force a join to be performed and five levels deep
Parents.find({}, {autojoin:{automatic:true, depth:5}});
```

## Notes
There are a few things to note:

  1.  The collection property refers to the name of the Mongo.Collection
  object that is created (e.g. Children = new Mongo.Collection... )
  and not the name of the collection stored internally in Mongo (e.g.
  "children").
  1.  Internally, the joins are performed using findOne and will continue to
  recurse through schemas up until the joinDepth is reached.  If the
  joinDepth is 0, no join will be performed.  If the joinDepth is 1, one
  level of joins will be performed, and so on.
  1. The id property is optional and will default to _id if not specified.
  It is included in the example for completeness.
  1. Autojoin does not currently handle arrays so an array of children would
  not work.
  1.  This was coded in a few hours so many use cases are still omitted, I'm
  sure.