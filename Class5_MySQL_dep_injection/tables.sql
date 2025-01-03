drop database if exists moviesdb;
create database moviesdb;
use moviesdb;

create table movies(
	id binary(16) primary key default(UUID_TO_BIN(UUID())),
	title varchar(255) not null,
	year int not null,
    director varchar(255) not null,
    duration int not null,
    poster text,
    rate decimal(2,1) unsigned not null
);

create table genres(
	id int auto_increment primary key,
    name varchar(255) not null unique
);

create table movie_genres(
	movie_id binary(16) references movies(id),
    genre_id int references genres(id),
    primary key (movie_id,genre_id)
);

insert into genres (name) values
('Drama'),
('Action'),
('Crime'),
('Adventure'),
('Sci-Fi'),
('Romance');


