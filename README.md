AutoJoin
=============

A simple join mechanism for meteor and SimpleSchema.

- [Installation](#installation)
- [Usage](#usage)

## Instalation
In your meteor app directory, enter:

```
meteor add dpankros:autojoin
```

## Usage
AutoJoin is almost completely hidden from view.  You need to define a
SimpleSchema for your data and add an autojoin property object to it.  For
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
 corresponding child object.  There are a few things to note:

  1.  The collection property refers to the name of the Mongo.Collection
  object that is created (e.g. Children = new Mongo.Collection... )
  and not the name of the collection stored internally in Mongo (e.g.
  "children").
  1.  Internally, the joins are performed using findOne and will continue to
  recurse through schemas as far as it can.  Infinite loops are a real
  possibility if you are not careful and there currently is no guard in place
  to prevent this.
  1. The id property is optional and will default to _id if not specified.
  It is included in the example for completeness.
  1. Autojoin does not currently handle arrays so an array of children would
  not work.
  1.  This was coded in a few hours so many use cases are still omitted, I'm
  sure.  For example, there is no way to disable the document expansion and,
  thus, this will make for difficult updates as AutoJoin does not undo the
  expansion during updates.  Thus, you can mess up your data if you aren't
  careful.