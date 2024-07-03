const jsonServer = require('json-server');
const fs = require('fs');
const path = require('path');

const server = jsonServer.create();
const middlewares = jsonServer.defaults();

const posts = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'posts.json'), 'utf-8')
);
const comments = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'comments.json'), 'utf-8')
);

const db = {
  posts: posts.posts,
  comments: comments.comments,
};

const router = jsonServer.router(db);

// Load and apply custom routes
const routes = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'routes.json'), 'utf-8')
);
server.use(jsonServer.rewriter(routes));

// Middleware to handle writes to the appropriate file
router.render = (req, res) => {
  res.jsonp(res.locals.data);

  const writeData = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  };

  if (
    req.method === 'POST' ||
    req.method === 'PUT' ||
    req.method === 'PATCH' ||
    req.method === 'DELETE'
  ) {
    const db = router.db; // Lowdb instance

    writeData(path.join(__dirname, 'posts.json'), {
      posts: db.get('posts').value(),
    });
    writeData(path.join(__dirname, 'comments.json'), {
      comments: db.get('comments').value(),
    });
  }
};

server.use(middlewares);
server.use(router);

server.listen(3001, () => {
  console.log('JSON Server is running on port 3001');
});
