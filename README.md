AutoJoin
=============

A simple join mechanism for meteor, SimpleSchema and Collection2.

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
preferences that you may never even have to access.  To use AutoJoin, define
a SimpleSchema for your data and add an autojoin property object to it.  For
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
      collection: Children, //references the Children global variable
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

Thus, instead of
 ```
//parent
{
  _id:  '00parent_id00',
  name: 'parent',
  child: '00child_id00'
}
//and child
{
  _id: '00child_id00,
  name: 'child',
}
```
A query for the same parent would return
```
{
  _id:  '00parent_id00',
  name: 'parent',
  child: {
    _id: '00child_id00,
    name: 'child',
  }
}
```
Arrays work in the same way, just define an array property in your SimpleSchema.

## Advanced Usage
AutoJoin has basic configuration capabilities.  These are done be setting
properties in the AutoJoin.prefs object.  E.g.:
```
//Don't join unless we tell you to
AutoJoin.prefs.automatic = false;

//Recurse up to four levels deep
AutoJoin.prefs.depth = 4;
```

Additionally, these options can be set on a case-by-case basis by specifying
options to Collection.Find or Collection.FindOne.  For example:

```
//don't perform a join at all, regardless of the default depth
Parents.find({}, {autojoin:{join:false}});

//if we join, only recurse one level deep.  If automatic is false, no join
will be performed regardless of depth
Parents.find({}, {autojoin:{depth:1}};

//force a join to be performed and five levels deep
Parents.find({}, {autojoin:{join:true, depth:5}});
```

To extend the above example, let's say our datamodel was changed to:
```
Children = new Mongo.Collection("children");

ChildSchema = new SimpleSchema({
  name: {
    type: String,
    label: "Name",
  },
  parent: {
    type: String,
    label: 'Parent',
    autojoin: {
      collection: Parents
    }
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
      collection: Children
    }
  }
});

Parents.attachSchema(ParentSchema);
```
In this case, queries to parent with a depth of 1 will return basically the
same object as in our basic example, namely:
 ```
 {
   _id:  '00parent_id00',
   name: 'parent',
   child: {  //<<-- LEVEL 1: expands to the child object
     _id: '00child_id00,
     name: 'child',
     parent: '00parent_id00'
   }
 }
 ```
 If we specified a depth of 2, however, things change:
 ```
{
   _id:  '00parent_id00',
   name: 'parent',
   child: {  // <<-- LEVEL 1: Expands the child object
     _id: '00child_id00,
     name: 'child',
     parent: {  //<<-- LEVEL 2: Expands the parent object (again)
       _id:  '00parent_id00',
       name: 'parent',
       child: '00child_id00'
     }
   }
 }
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
  It is included in the basic example for completeness.
  1. Specifying a depth of -1 or any negative number will cause infinite
  expansion, even in the case of infinte loops.  I don't recommend it.
  1.  This was coded in a few hours so many use cases are still omitted, I'm
  sure.