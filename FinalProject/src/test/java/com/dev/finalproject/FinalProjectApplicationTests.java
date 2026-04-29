package com.dev.finalproject;

import com.dev.finalproject.game.GameRepository;
import com.dev.finalproject.rating.RatingRepository;
import com.dev.finalproject.score.ScoreRepository;
import com.dev.finalproject.upload.ProfileImageUploadRepository;
import com.dev.finalproject.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest(properties = {
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration," +
                "org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration," +
                "org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration"
})
class FinalProjectApplicationTests {
    @MockitoBean
    UserRepository userRepository;

    @MockitoBean
    GameRepository gameRepository;

    @MockitoBean
    RatingRepository ratingRepository;

    @MockitoBean
    ScoreRepository scoreRepository;

    @MockitoBean
    ProfileImageUploadRepository profileImageUploadRepository;

	@Test
	void contextLoads() {
	}

}
