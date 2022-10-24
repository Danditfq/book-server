const db = require("../models");
const Tutorial = db.tutorials;
const Op = db.Sequelize.Op;
const memjs = require('memjs');

const mc = memjs.Client.create('elasticache-dandi.sonoao.0001.apse2.cache.amazonaws.com:11211');

// Create and Save a new Tutorial
exports.create = (req, res) => {
  // Validate request
  if (!req.body.title) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a Tutorial
  const tutorial = {
    title: req.body.title,
    description: req.body.description,
    published: req.body.published ? req.body.published : false
  };

  // Save Tutorial in the database
  Tutorial.create(tutorial)
    .then(data => {
      Tutorial.findAll()
        .then(isian => {
          mc.set('data', JSON.stringify(isian))
        })
        .catch(errx => {
          console.log("error")
        });
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Tutorial."
      });
    });
};

// Retrieve all Tutorials from the database.
exports.findAll = (req, res) => {
  const title = req.query.title;
  var condition = title ? { title: { [Op.like]: `%${title}%` } } : null;

  if (condition === null){
    var result = []
    mc.get('data', function (err, value, key){
        values = value.toString()
        values = values.replace('[','')
        values = values.replace(']','')
        values = values.split(',{')
        values[0] = values[0].replace('{','')
        for (let i = 0; i < values.length; i++) {
            values[i] = values[i].replace(`"id":`, '')
            values[i] = values[i].replace(`"title":`, '')
            values[i] = values[i].replace(`"description":`, '')
            values[i] = values[i].replace(`"published":`, '')
            values[i] = values[i].replace(`"createdAt":`, '')
            values[i] = values[i].replace(`"updatedAt":`, '')
            values[i] = values[i].replace(`}`,'')
            values[i] = values[i].replaceAll(`"`,'')
            valuez = values[i]
            valuez = valuez.split(',')
            resultObj = {
                'id': valuez[0],
                'title': valuez[1],
                'description': valuez[2],
                'published': valuez[3],
                'createdAt': valuez[4],
                'updatedAt': valuez[5],
            }
            result.push(resultObj)
        }
        res.send(result);
    })
    console.log("Ambil dari Memcad")
  }else{
    Tutorial.findAll({ where: condition })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials."
      });
    });
    console.log("Ambil dari DB")
  }
};

// Find a single Tutorial with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Tutorial.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Tutorial with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Tutorial with id=" + id
      });
    });
};

// Update a Tutorial by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Tutorial.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      Tutorial.findAll()
        .then(isian => {
          mc.set('data', JSON.stringify(isian))
        })
        .catch(errx => {
          console.log("error")
        });
      if (num == 1) {
        res.send({
          message: "Tutorial was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Tutorial with id=${id}. Maybe Tutorial was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Tutorial with id=" + id
      });
    });
};

// Delete a Tutorial with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Tutorial.destroy({
    where: { id: id }
  })
    .then(num => {
      Tutorial.findAll()
        .then(isian => {
          mc.set('data', JSON.stringify(isian))
        })
        .catch(errx => {
          console.log("error")
        });
      if (num == 1) {
        res.send({
          message: "Tutorial was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Tutorial with id=${id}. Maybe Tutorial was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Tutorial with id=" + id
      });
    });
};

// Delete all Tutorials from the database.
exports.deleteAll = (req, res) => {
  Tutorial.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      Tutorial.findAll()
        .then(isian => {
          mc.set('data', JSON.stringify(isian))
        })
        .catch(errx => {
          console.log("error")
        });
      res.send({ message: `${nums} Tutorials were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all tutorials."
      });
    });
};

// find all published Tutorial
exports.findAllPublished = (req, res) => {
  Tutorial.findAll({ where: { published: true } })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials."
      });
    });
};
