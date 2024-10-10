exports.getLogin = (req, res) => {
    res.render('login', { title: 'Login' });
  };
  
  exports.getSignup = (req, res) => {
    res.render('signup', { title: 'Sign Up' });
  };
  
  exports.postLogin = (req, res) => {
    // Implement login logic here
    res.send('Login POST route');
  };
  
  exports.postSignup = (req, res) => {
    // Implement signup logic here
    res.send('Signup POST route');
  };