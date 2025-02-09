CREATE TABLE "requests" (
	"id"	serial		NOT NULL,
	"time"	timestamp		NOT NULL,
	"status"	char		NOT NULL,
	"isbn"	varchar(13)		NOT NULL,
	"libraryId"	serial		NOT NULL
);

CREATE TABLE "useruser" (
	"id"	serial		NOT NULL,
	"username"	varchar(40)		NOT NULL,
	"name"	varchar(50)		NOT NULL,
	"profilePic"	varchar(100)		NULL,
	"bio"	varchar(80)		NULL
);

CREATE TABLE "review" (
	"userId"	serial		NOT NULL,
	"isbn"	varchar(13)		NOT NULL,
	"rating"	int		NOT NULL,
	"content"	varchar(500)		NULL
);

CREATE TABLE "library" (
	"id"	serial		NOT NULL,
	"name"	varchar(20)		NOT NULL
);

CREATE TABLE "mytagged" (
	"isbn"	varchar(13)		NOT NULL,
	"myTagId"	serial		NOT NULL
);

CREATE TABLE "affiliates" (
	"libraryId"	serial		NOT NULL,
	"userId"	serial		NOT NULL,
	"authority"	int		NOT NULL
);

CREATE TABLE "book" (
	"isbn"	varchar(13)		NOT NULL
);

CREATE TABLE "shelf" (
	"id"	serial		NOT NULL,
	"name"	varchar(20)		NOT NULL,
	"userId"	serial		NOT NULL
);

CREATE TABLE "mytag" (
	"id"	serial		NOT NULL,
	"name"	varchar(10)		NOT NULL,
	"userId"	serial		NOT NULL
);

CREATE TABLE "contains" (
	"shelfId"	serial		NOT NULL,
	"isbn"	varchar(13)		NOT NULL
);

CREATE TABLE "provides" (
	"isbn"	varchar(13)		NOT NULL,
	"libraryId"	serial		NOT NULL
);

CREATE TABLE "likes" (
	"userId"	serial		NOT NULL,
	"isbn"	varchar(13)		NOT NULL
);

CREATE TABLE "article" (
	"id"	serial		NOT NULL,
	"title"	varchar(100)		NOT NULL,
	"content"	varchar(3000)		NOT NULL,
	"userId"	serial		NOT NULL,
	"isbn"	varchar(13)		NOT NULL
);

ALTER TABLE "requests" ADD CONSTRAINT "PK_REQUESTS" PRIMARY KEY (
	"id"
);

ALTER TABLE "useruser" ADD CONSTRAINT "PK_USERUSER" PRIMARY KEY (
	"id"
);

ALTER TABLE "review" ADD CONSTRAINT "PK_REVIEW" PRIMARY KEY (
	"userId",
	"isbn"
);

ALTER TABLE "library" ADD CONSTRAINT "PK_LIBRARY" PRIMARY KEY (
	"id"
);

ALTER TABLE "mytagged" ADD CONSTRAINT "PK_MYTAGGED" PRIMARY KEY (
	"isbn",
	"myTagId"
);

ALTER TABLE "affiliates" ADD CONSTRAINT "PK_AFFILIATES" PRIMARY KEY (
	"libraryId",
	"userId"
);

ALTER TABLE "book" ADD CONSTRAINT "PK_BOOK" PRIMARY KEY (
	"isbn"
);

ALTER TABLE "shelf" ADD CONSTRAINT "PK_SHELF" PRIMARY KEY (
	"id"
);

ALTER TABLE "mytag" ADD CONSTRAINT "PK_MYTAG" PRIMARY KEY (
	"id"
);

ALTER TABLE "contains" ADD CONSTRAINT "PK_CONTAINS" PRIMARY KEY (
	"shelfId",
	"isbn"
);

ALTER TABLE "provides" ADD CONSTRAINT "PK_PROVIDES" PRIMARY KEY (
	"isbn",
	"libraryId"
);

ALTER TABLE "likes" ADD CONSTRAINT "PK_LIKES" PRIMARY KEY (
	"userId",
	"isbn"
);

ALTER TABLE "article" ADD CONSTRAINT "PK_ARTICLE" PRIMARY KEY (
	"id"
);

ALTER TABLE "requests" ADD CONSTRAINT "FK_book_TO_requests_1" FOREIGN KEY (
	"isbn"
)
REFERENCES "book" (
	"isbn"
);

ALTER TABLE "requests" ADD CONSTRAINT "FK_library_TO_requests_1" FOREIGN KEY (
	"libraryId"
)
REFERENCES "library" (
	"id"
);

ALTER TABLE "review" ADD CONSTRAINT "FK_useruser_TO_review_1" FOREIGN KEY (
	"userId"
)
REFERENCES "useruser" (
	"id"
);

ALTER TABLE "review" ADD CONSTRAINT "FK_book_TO_review_1" FOREIGN KEY (
	"isbn"
)
REFERENCES "book" (
	"isbn"
);

ALTER TABLE "mytagged" ADD CONSTRAINT "FK_book_TO_mytagged_1" FOREIGN KEY (
	"isbn"
)
REFERENCES "book" (
	"isbn"
);

ALTER TABLE "mytagged" ADD CONSTRAINT "FK_mytag_TO_mytagged_1" FOREIGN KEY (
	"myTagId"
)
REFERENCES "mytag" (
	"id"
);

ALTER TABLE "affiliates" ADD CONSTRAINT "FK_library_TO_affiliates_1" FOREIGN KEY (
	"libraryId"
)
REFERENCES "library" (
	"id"
);

ALTER TABLE "affiliates" ADD CONSTRAINT "FK_useruser_TO_affiliates_1" FOREIGN KEY (
	"userId"
)
REFERENCES "useruser" (
	"id"
);

ALTER TABLE "shelf" ADD CONSTRAINT "FK_useruser_TO_shelf_1" FOREIGN KEY (
	"userId"
)
REFERENCES "useruser" (
	"id"
);

ALTER TABLE "mytag" ADD CONSTRAINT "FK_useruser_TO_mytag_1" FOREIGN KEY (
	"userId"
)
REFERENCES "useruser" (
	"id"
);

ALTER TABLE "contains" ADD CONSTRAINT "FK_shelf_TO_contains_1" FOREIGN KEY (
	"shelfId"
)
REFERENCES "shelf" (
	"id"
);

ALTER TABLE "contains" ADD CONSTRAINT "FK_book_TO_contains_1" FOREIGN KEY (
	"isbn"
)
REFERENCES "book" (
	"isbn"
);

ALTER TABLE "provides" ADD CONSTRAINT "FK_book_TO_provides_1" FOREIGN KEY (
	"isbn"
)
REFERENCES "book" (
	"isbn"
);

ALTER TABLE "provides" ADD CONSTRAINT "FK_library_TO_provides_1" FOREIGN KEY (
	"libraryId"
)
REFERENCES "library" (
	"id"
);

ALTER TABLE "likes" ADD CONSTRAINT "FK_useruser_TO_likes_1" FOREIGN KEY (
	"userId"
)
REFERENCES "useruser" (
	"id"
);

ALTER TABLE "likes" ADD CONSTRAINT "FK_book_TO_likes_1" FOREIGN KEY (
	"isbn"
)
REFERENCES "book" (
	"isbn"
);

ALTER TABLE "article" ADD CONSTRAINT "FK_useruser_TO_article_1" FOREIGN KEY (
	"userId"
)
REFERENCES "useruser" (
	"id"
);

ALTER TABLE "article" ADD CONSTRAINT "FK_book_TO_article_1" FOREIGN KEY (
	"isbn"
)
REFERENCES "book" (
	"isbn"
);

/* Temporary user for testing */
INSERT INTO useruser("username", "name") values('kdh', 'Kim Dohyeon') RETURNING id;

INSERT INTO book("isbn") values('9788928600915');
INSERT INTO book("isbn") values('9791191583793');
INSERT INTO book("isbn") values('9791189327156');

INSERT INTO library("name") values('전투모의지원중대') RETURNING id;

INSERT INTO provides("isbn", "libraryId") values('9788928600915', 1);
INSERT INTO provides("isbn", "libraryId") values('9791191583793', 1);
INSERT INTO provides("isbn", "libraryId") values('9791189327156', 1);

INSERT INTO review("userId", "isbn", "rating", "content") values(1, '9788928600915', 4, '"4 - 3" 이것은 단순한 수식이 아니다. 가슴이 철렁내려앉고, 머리속이 하얗게 질려버리는 충격적인 사건후에 홀로 남은 바버라의 이야기인 것이다.');
INSERT INTO review("userId", "isbn", "rating", "content") values(1, '9791191583793', 4, '새처럼 지구의 이곳저곳을 여행하던 저자가, 새를 위해 지구를 위해 여행을 자제하기로 마음먹게 되는 과정이 흥미로웠다. 닮고 싶은 태도, 닮고 싶은 작가다.');
INSERT INTO review("userId", "isbn", "rating", "content") values(1, '9791189327156', 4, '그어 놓은 선 저 너머를 보려고 노력하는 것. 그 자체가 삶의 소중함과 삶을 살아가는 지침이 될 수 있다는 것.');