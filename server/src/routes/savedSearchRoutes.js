const express = require('express');
const router = express.Router();
const {
  getSearchOptions,
  getSavedSearches,
  createSavedSearch,
  updateSavedSearch,
  deleteSavedSearch,
  runSearchNow,
} = require('../controllers/savedSearchController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/options', getSearchOptions);

router.route('/')
  .get(getSavedSearches)
  .post(createSavedSearch);

router.route('/:id')
  .put(updateSavedSearch)
  .delete(deleteSavedSearch);

router.post('/:id/run', runSearchNow);

module.exports = router;
