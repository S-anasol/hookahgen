/* jshint undef: true, unused: true */
/*global angular */

/*
 * Line below lets us save `this` as `TC`
 * to make properties look exactly the same as in the template
 */
//jscs:disable safeContextKeyword
(function() {
    'use strict';

    angular.module('todoCtrl', [])

    /**
     * The main controller for the app. The controller:
     * - retrieves and persists the model via the todoStorage service
     * - exposes the model to the template and provides event handlers
     */
    .controller('TodoCtrl', function TodoCtrl($scope, $location, todoStorage) {
        var TC = this;
        var todos = TC.todos = todoStorage.get('todos');
        var tobacco = TC.tobacco = todoStorage.get('tobacco');

        TC.ESCAPE_KEY = 27;
        TC.editedTobacco = {};

        function resetTobacco() {
            TC.newTobacco = {
                title: '',
                completed: false
            };
        }

        resetTobacco();


        function resetTodo() {
            TC.newTodo = {
                title: '',
                completed: false
            };
        }

        resetTodo();

        if ($location.path() === '') {
            $location.path('/');
        }

        TC.location = $location;

        $scope.$watch('TC.location.path()', function(path) {
            TC.statusFilter = {
                '/active': {
                    completed: false
                },
                '/completed': {
                    completed: true
                }
            }[path];
        });

        // 3rd argument `true` for deep object watching
        $scope.$watch('TC.todos', function() {
            TC.remainingCount = todos.filter(function(todo) {
                return !todo.completed;
            }).length;
            TC.allChecked = (TC.remainingCount === 0);

            todoStorage.put('todos', todos);
        }, true);

        $scope.$watch('TC.tobacco', function() {
            todoStorage.put('tobacco', tobacco);
        }, true);

        TC.addTodo = function(title) {
            var newTitle = title.trim();
            if (newTitle.length === 0) {
                return;
            }

            var found = false;

            todos.forEach(function(todo) {
                if (todo.title === newTitle) {
                    found = true;
                }
            });

            if (!found) {
                todos.push({
                    title: newTitle,
                    completed: false
                });
                return true;
            } else {
                return false;
            }
        };

        TC.editTodo = function(todo) {
            TC.editedTodo = todo;

            // Clone the original todo to restore it on demand.
            TC.originalTodo = angular.copy(todo);
        };

        TC.doneEditing = function(todo, index) {
            TC.editedTodo = {};
            todo.title = todo.title.trim();

            if (!todo.title) {
                TC.removeTodo(index);
            }
        };

        TC.revertEditing = function(index) {
            TC.editedTodo = {};
            todos[index] = TC.originalTodo;
        };

        TC.removeTodo = function(index) {
            todos.splice(index, 1);
        };

        TC.clearCompletedTodos = function() {
            TC.todos = todos = todos.filter(function(val) {
                return !val.completed;
            });
        };

        TC.markAll = function(completed) {
            todos.forEach(function(todo) {
                todo.completed = completed;
            });
        };

        TC.addTobacco = function() {
            var newTitle = TC.newTobacco.title = TC.newTobacco.title.trim();
            if (newTitle.length === 0) {
                return;
            }

            tobacco.push(TC.newTobacco);
            resetTobacco();
        };

        TC.editTobacco = function(_tobacco) {
            TC.editedTobacco = _tobacco;

            // Clone the original todo to restore it on demand.
            TC.originalTobacco = angular.copy(_tobacco);
        };

        TC.doneEditingTobacco = function(tobacco, index) {
            TC.editedTobacco = {};
            tobacco.title = tobacco.title.trim();

            if (!tobacco.title) {
                TC.removeTobacco(index);
            }
        };

        TC.revertEditingTobacco = function(index) {
            TC.editedTobacco = {};
            tobacco[index] = TC.originalTobacco;
        };

        TC.removeTobacco = function(index) {
            tobacco.splice(index, 1);
        };

        TC.clearCompletedTobacco = function() {
            TC.tobacco = tobacco = tobacco.filter(function(val) {
                return !val.completed;
            });
        };

        TC.markAllTobacco = function(completed) {
            tobacco.forEach(function(tobacco) {
                tobacco.completed = completed;
            });
        };

        TC.generateMixes = function(minCombi) {
            function k_combinations(set, k) {
                var i, j, combs, head, tailcombs;

                // There is no way to take e.g. sets of 5 elements from
                // a set of 4.
                if (k > set.length || k <= 0) {
                    return [];
                }

                // K-sized set has only one K-sized subset.
                if (k == set.length) {
                    return [set];
                }

                // There is N 1-sized subsets in a N-sized set.
                if (k == 1) {
                    combs = [];
                    for (i = 0; i < set.length; i++) {
                        combs.push([set[i]]);
                    }
                    return combs;
                }

                // Assert {1 < k < set.length}

                // Algorithm description:
                // To get k-combinations of a set, we want to join each element
                // with all (k-1)-combinations of the other elements. The set of
                // these k-sized sets would be the desired result. However, as we
                // represent sets with lists, we need to take duplicates into
                // account. To avoid producing duplicates and also unnecessary
                // computing, we use the following approach: each element i
                // divides the list into three: the preceding elements, the
                // current element i, and the subsequent elements. For the first
                // element, the list of preceding elements is empty. For element i,
                // we compute the (k-1)-computations of the subsequent elements,
                // join each with the element i, and store the joined to the set of
                // computed k-combinations. We do not need to take the preceding
                // elements into account, because they have already been the i:th
                // element so they are already computed and stored. When the length
                // of the subsequent list drops below (k-1), we cannot find any
                // (k-1)-combs, hence the upper limit for the iteration:
                combs = [];
                for (i = 0; i < set.length - k + 1; i++) {
                    // head is a list that includes only our current element.
                    head = set.slice(i, i + 1);
                    // We take smaller combinations from the subsequent elements
                    tailcombs = k_combinations(set.slice(i + 1), k - 1);
                    // For each (k-1)-combination we join it with the current
                    // and store it to the set of k-combinations.
                    for (j = 0; j < tailcombs.length; j++) {
                        combs.push(head.concat(tailcombs[j]));
                    }
                }
                return combs;
            }

            var added = 0,
                skipped = 0;

            for (var i = minCombi; i <= tobacco.length; i++) {
                var combinations = k_combinations(tobacco.map(function(tobacco) {
                    return tobacco.title
                }), i);
                console.log('combs', combinations, i);
                combinations.forEach(function(q1) {
                    console.log('comb', q1);
                    if (TC.addTodo(q1.join(' + '))) {
                        added++;
                    } else {
                        skipped++;
                    }
                });
            }
            alert('New mixes: ' + added + '. Skipped mixes: ' + skipped);
        };
    });
})();
//jscs:enable
