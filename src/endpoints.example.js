(function () {
    var mockData = angular.module('mock.fixtures', []);

    mockData.value('MockFixtures', {
        job: {
            methods: 'CREATE|READ|UPDATE|DELETE',
            matcher: /\/job(?:\/(\d*))*/,
            data: [
                {title: 'job 1'},
                {title: 'job 2'}
            ],
            primaryKey: 'id'
        },
        candidate: {
            methods: 'CREATE|READ|UPDATE|DELETE',
            matcher: /\/candidate(?:\/(\d*))*/,
            data: [
                {name: 'cand 1'},
                {name: 'cand 2'}
            ]
        }
    });

    mockData.value('clearLocalStorageOnLoad', true);
    mockData.value('apiPrefix', /\/api/);
}());
