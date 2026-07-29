--
-- PostgreSQL database dump
--


-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

-- Started on 2026-07-22 00:39:06

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 3 (class 3079 OID 17703)
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- TOC entry 5531 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


--
-- TOC entry 2 (class 3079 OID 17665)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 5532 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 299 (class 1255 OID 17808)
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_updated_at() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 243 (class 1259 OID 18063)
-- Name: ai_models; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_models (
    ai_model_id integer NOT NULL,
    model_name character varying(100) NOT NULL,
    version character varying(20) NOT NULL,
    model_type character varying(30) DEFAULT 'static_classifier'::character varying NOT NULL,
    file_path text NOT NULL,
    accuracy_score numeric(5,2),
    is_active boolean DEFAULT true NOT NULL,
    deployed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_ai_models_accuracy CHECK (((accuracy_score IS NULL) OR ((accuracy_score >= (0)::numeric) AND (accuracy_score <= (100)::numeric)))),
    CONSTRAINT chk_ai_models_type CHECK (((model_type)::text = ANY ((ARRAY['static_classifier'::character varying, 'dynamic_classifier'::character varying, 'hybrid'::character varying])::text[])))
);


ALTER TABLE public.ai_models OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 18062)
-- Name: ai_models_ai_model_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ai_models_ai_model_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ai_models_ai_model_id_seq OWNER TO postgres;

--
-- TOC entry 5533 (class 0 OID 0)
-- Dependencies: 242
-- Name: ai_models_ai_model_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ai_models_ai_model_id_seq OWNED BY public.ai_models.ai_model_id;


--
-- TOC entry 246 (class 1259 OID 18123)
-- Name: ai_predictions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_predictions (
    prediction_id bigint NOT NULL,
    session_id uuid NOT NULL,
    expected_sign_id integer NOT NULL,
    predicted_sign_id integer,
    ai_model_id integer NOT NULL,
    confidence_score numeric(5,4),
    raw_landmarks jsonb,
    predicted_at timestamp with time zone DEFAULT now() CONSTRAINT ai_predictions_created_at_not_null NOT NULL,
    frame_sequence_no integer DEFAULT 0 NOT NULL,
    is_correct boolean GENERATED ALWAYS AS ((expected_sign_id = predicted_sign_id)) STORED,
    CONSTRAINT chk_ai_predictions_confidence CHECK (((confidence_score IS NULL) OR ((confidence_score >= (0)::numeric) AND (confidence_score <= (1)::numeric)))),
    CONSTRAINT chk_ai_predictions_frame CHECK ((frame_sequence_no >= 0))
);


ALTER TABLE public.ai_predictions OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 18122)
-- Name: ai_predictions_prediction_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ai_predictions_prediction_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ai_predictions_prediction_id_seq OWNER TO postgres;

--
-- TOC entry 5534 (class 0 OID 0)
-- Dependencies: 245
-- Name: ai_predictions_prediction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ai_predictions_prediction_id_seq OWNED BY public.ai_predictions.prediction_id;


--
-- TOC entry 254 (class 1259 OID 18249)
-- Name: analytics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.analytics (
    analytics_id bigint NOT NULL,
    user_id uuid NOT NULL,
    metric_date date NOT NULL,
    average_accuracy numeric(5,2),
    completed_lessons integer DEFAULT 0 NOT NULL,
    total_sessions integer DEFAULT 0 NOT NULL,
    weak_sign integer,
    total_practice_time integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_analytics_accuracy CHECK (((average_accuracy IS NULL) OR ((average_accuracy >= (0)::numeric) AND (average_accuracy <= (100)::numeric))))
);


ALTER TABLE public.analytics OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 18248)
-- Name: analytics_analytics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.analytics_analytics_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.analytics_analytics_id_seq OWNER TO postgres;

--
-- TOC entry 5535 (class 0 OID 0)
-- Dependencies: 253
-- Name: analytics_analytics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.analytics_analytics_id_seq OWNED BY public.analytics.analytics_id;


--
-- TOC entry 248 (class 1259 OID 18159)
-- Name: assessments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assessments (
    assessment_id bigint NOT NULL,
    session_id uuid NOT NULL,
    attempt_number integer NOT NULL,
    predicted_sign_id integer,
    expected_sign_id integer NOT NULL,
    confidence_score numeric(5,4),
    accuracy_percentage numeric(5,2) NOT NULL,
    is_correct boolean GENERATED ALWAYS AS ((NOT (predicted_sign_id IS DISTINCT FROM expected_sign_id))) STORED,
    grade character varying(5),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_assessments_accuracy CHECK (((accuracy_percentage >= (0)::numeric) AND (accuracy_percentage <= (100)::numeric))),
    CONSTRAINT chk_assessments_attempt_number CHECK ((attempt_number >= 1)),
    CONSTRAINT chk_assessments_confidence CHECK (((confidence_score IS NULL) OR ((confidence_score >= (0)::numeric) AND (confidence_score <= (1)::numeric))))
);


ALTER TABLE public.assessments OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 18158)
-- Name: assessments_assessment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.assessments_assessment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assessments_assessment_id_seq OWNER TO postgres;

--
-- TOC entry 5536 (class 0 OID 0)
-- Dependencies: 247
-- Name: assessments_assessment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assessments_assessment_id_seq OWNED BY public.assessments.assessment_id;


--
-- TOC entry 233 (class 1259 OID 17944)
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    log_id bigint NOT NULL,
    user_id uuid,
    action character varying(100) NOT NULL,
    entity_type character varying(50),
    entity_id character varying(50),
    ip_address inet,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 17943)
-- Name: audit_logs_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_log_id_seq OWNER TO postgres;

--
-- TOC entry 5537 (class 0 OID 0)
-- Dependencies: 232
-- Name: audit_logs_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_log_id_seq OWNED BY public.audit_logs.log_id;


--
-- TOC entry 255 (class 1259 OID 18378)
-- Name: certificates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.certificates (
    certificate_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    module_id integer NOT NULL,
    certificate_code character varying(50) NOT NULL,
    issued_date date DEFAULT CURRENT_DATE NOT NULL,
    certificate_url character varying(255),
    status character varying(20) DEFAULT 'active'::character varying NOT NULL
);


ALTER TABLE public.certificates OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 18194)
-- Name: feedback; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.feedback (
    feedback_id bigint NOT NULL,
    assessment_id bigint NOT NULL,
    feedback_code character varying(30) NOT NULL,
    message text NOT NULL,
    severity character varying(10) DEFAULT 'low'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_feedback_code CHECK (((feedback_code)::text = ANY ((ARRAY['CORRECT'::character varying, 'FINGER_EXTENSION'::character varying, 'WRONG_SIGN'::character varying, 'LOW_VISIBILITY'::character varying, 'THUMB_POSITION'::character varying, 'TIMING'::character varying])::text[]))),
    CONSTRAINT chk_feedback_severity CHECK (((severity)::text = ANY ((ARRAY['none'::character varying, 'low'::character varying, 'medium'::character varying, 'high'::character varying])::text[])))
);


ALTER TABLE public.feedback OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 18193)
-- Name: feedback_feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.feedback_feedback_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.feedback_feedback_id_seq OWNER TO postgres;

--
-- TOC entry 5538 (class 0 OID 0)
-- Dependencies: 249
-- Name: feedback_feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.feedback_feedback_id_seq OWNED BY public.feedback.feedback_id;


--
-- TOC entry 258 (class 1259 OID 18454)
-- Name: instructor_students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instructor_students (
    instructor_student_id uuid DEFAULT gen_random_uuid() NOT NULL,
    instructor_id uuid NOT NULL,
    learner_id uuid NOT NULL,
    assigned_date date DEFAULT CURRENT_DATE NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT chk_instructor_student_status CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[])))
);


ALTER TABLE public.instructor_students OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 18008)
-- Name: lessons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lessons (
    lesson_id integer NOT NULL,
    module_id integer NOT NULL,
    title character varying(150) NOT NULL,
    description text,
    sequence_order integer NOT NULL,
    estimated_duration_minutes integer,
    difficulty_level character varying(20) DEFAULT 'beginner'::character varying NOT NULL,
    is_published boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    category character varying(30) DEFAULT 'Alphabet'::character varying NOT NULL,
    difficulty character varying(20) DEFAULT 'Easy'::character varying NOT NULL,
    CONSTRAINT chk_lessons_difficulty CHECK (((difficulty_level)::text = ANY ((ARRAY['beginner'::character varying, 'intermediate'::character varying, 'advanced'::character varying])::text[]))),
    CONSTRAINT chk_lessons_duration CHECK (((estimated_duration_minutes IS NULL) OR (estimated_duration_minutes > 0)))
);


ALTER TABLE public.lessons OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 18007)
-- Name: lessons_lesson_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lessons_lesson_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lessons_lesson_id_seq OWNER TO postgres;

--
-- TOC entry 5539 (class 0 OID 0)
-- Dependencies: 238
-- Name: lessons_lesson_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lessons_lesson_id_seq OWNED BY public.lessons.lesson_id;


--
-- TOC entry 237 (class 1259 OID 17978)
-- Name: modules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modules (
    module_id integer NOT NULL,
    sign_language_id integer NOT NULL,
    title character varying(150) NOT NULL,
    description text,
    difficulty_level character varying(20) DEFAULT 'beginner'::character varying NOT NULL,
    sequence_order integer NOT NULL,
    is_published boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_modules_difficulty CHECK (((difficulty_level)::text = ANY ((ARRAY['beginner'::character varying, 'intermediate'::character varying, 'advanced'::character varying])::text[])))
);


ALTER TABLE public.modules OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 17977)
-- Name: modules_module_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.modules_module_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.modules_module_id_seq OWNER TO postgres;

--
-- TOC entry 5540 (class 0 OID 0)
-- Dependencies: 236
-- Name: modules_module_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.modules_module_id_seq OWNED BY public.modules.module_id;


--
-- TOC entry 231 (class 1259 OID 17924)
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    token_id bigint NOT NULL,
    user_id uuid NOT NULL,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 17923)
-- Name: password_reset_tokens_token_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.password_reset_tokens_token_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_reset_tokens_token_id_seq OWNER TO postgres;

--
-- TOC entry 5541 (class 0 OID 0)
-- Dependencies: 230
-- Name: password_reset_tokens_token_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.password_reset_tokens_token_id_seq OWNED BY public.password_reset_tokens.token_id;


--
-- TOC entry 224 (class 1259 OID 17825)
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    permission_id integer NOT NULL,
    permission_key character varying(100) NOT NULL,
    description text
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 17824)
-- Name: permissions_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permissions_permission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permissions_permission_id_seq OWNER TO postgres;

--
-- TOC entry 5542 (class 0 OID 0)
-- Dependencies: 223
-- Name: permissions_permission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permissions_permission_id_seq OWNED BY public.permissions.permission_id;


--
-- TOC entry 244 (class 1259 OID 18085)
-- Name: practice_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.practice_sessions (
    session_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    lesson_id integer NOT NULL,
    expected_sign_id integer NOT NULL,
    status character varying(20) DEFAULT 'in_progress'::character varying NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    ended_at timestamp with time zone,
    attempt_count integer DEFAULT 0 NOT NULL,
    duration_seconds integer,
    device_info jsonb,
    CONSTRAINT chk_practice_sessions_attempt_count CHECK ((attempt_count >= 0)),
    CONSTRAINT chk_practice_sessions_duration CHECK (((duration_seconds IS NULL) OR (duration_seconds >= 0))),
    CONSTRAINT chk_practice_sessions_status CHECK (((status)::text = ANY ((ARRAY['in_progress'::character varying, 'completed'::character varying, 'abandoned'::character varying])::text[]))),
    CONSTRAINT chk_practice_sessions_time CHECK (((ended_at IS NULL) OR (ended_at >= started_at)))
);


ALTER TABLE public.practice_sessions OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 18404)
-- Name: recommendations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recommendations (
    recommendation_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    lesson_id integer NOT NULL,
    recommendation_type character varying(50) NOT NULL,
    priority character varying(20) DEFAULT 'medium'::character varying NOT NULL,
    message text,
    is_completed boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.recommendations OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 17902)
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    token_id bigint NOT NULL,
    user_id uuid NOT NULL,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    revoked boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 17901)
-- Name: refresh_tokens_token_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.refresh_tokens_token_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.refresh_tokens_token_id_seq OWNER TO postgres;

--
-- TOC entry 5543 (class 0 OID 0)
-- Dependencies: 228
-- Name: refresh_tokens_token_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.refresh_tokens_token_id_seq OWNED BY public.refresh_tokens.token_id;


--
-- TOC entry 225 (class 1259 OID 17837)
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    role_id integer NOT NULL,
    permission_id integer NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 17810)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    role_id integer NOT NULL,
    role_name character varying(50) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 17809)
-- Name: roles_role_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_role_id_seq OWNER TO postgres;

--
-- TOC entry 5544 (class 0 OID 0)
-- Dependencies: 221
-- Name: roles_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_role_id_seq OWNED BY public.roles.role_id;


--
-- TOC entry 235 (class 1259 OID 17962)
-- Name: sign_languages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sign_languages (
    sign_language_id integer NOT NULL,
    code character varying(10) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.sign_languages OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 17961)
-- Name: sign_languages_sign_language_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sign_languages_sign_language_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sign_languages_sign_language_id_seq OWNER TO postgres;

--
-- TOC entry 5545 (class 0 OID 0)
-- Dependencies: 234
-- Name: sign_languages_sign_language_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sign_languages_sign_language_id_seq OWNED BY public.sign_languages.sign_language_id;


--
-- TOC entry 241 (class 1259 OID 18039)
-- Name: signs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.signs (
    sign_id integer NOT NULL,
    lesson_id integer NOT NULL,
    sign_name character varying(100) NOT NULL,
    sign_type character varying(20) DEFAULT 'static'::character varying NOT NULL,
    reference_video_url text,
    reference_image_url text,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_signs_type CHECK (((sign_type)::text = ANY ((ARRAY['static'::character varying, 'dynamic'::character varying])::text[])))
);


ALTER TABLE public.signs OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 18038)
-- Name: signs_sign_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.signs_sign_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.signs_sign_id_seq OWNER TO postgres;

--
-- TOC entry 5546 (class 0 OID 0)
-- Dependencies: 240
-- Name: signs_sign_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.signs_sign_id_seq OWNED BY public.signs.sign_id;


--
-- TOC entry 252 (class 1259 OID 18218)
-- Name: user_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_progress (
    progress_id bigint NOT NULL,
    user_id uuid NOT NULL,
    lesson_id integer NOT NULL,
    status character varying(20) DEFAULT 'not_started'::character varying NOT NULL,
    best_accuracy numeric(5,2),
    attempts_count integer DEFAULT 0 NOT NULL,
    completed_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_user_progress_accuracy CHECK (((best_accuracy IS NULL) OR ((best_accuracy >= (0)::numeric) AND (best_accuracy <= (100)::numeric)))),
    CONSTRAINT chk_user_progress_status CHECK (((status)::text = ANY ((ARRAY['not_started'::character varying, 'in_progress'::character varying, 'completed'::character varying])::text[])))
);


ALTER TABLE public.user_progress OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 18217)
-- Name: user_progress_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_progress_progress_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_progress_progress_id_seq OWNER TO postgres;

--
-- TOC entry 5547 (class 0 OID 0)
-- Dependencies: 251
-- Name: user_progress_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_progress_progress_id_seq OWNED BY public.user_progress.progress_id;


--
-- TOC entry 227 (class 1259 OID 17882)
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    user_id uuid NOT NULL,
    role_id integer NOT NULL,
    assigned_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 17856)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id uuid DEFAULT gen_random_uuid() NOT NULL,
    full_name character varying(150) NOT NULL,
    email public.citext NOT NULL,
    username character varying(50),
    password_hash character varying(255) NOT NULL,
    phone character varying(20),
    date_of_birth date,
    profile_picture_url text,
    is_active boolean DEFAULT true NOT NULL,
    is_email_verified boolean DEFAULT false NOT NULL,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_users_dob CHECK (((date_of_birth IS NULL) OR (date_of_birth <= CURRENT_DATE)))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 18432)
-- Name: weekly_analytics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.weekly_analytics (
    weekly_analytics_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    week_start date NOT NULL,
    average_accuracy double precision,
    completed_lessons integer DEFAULT 0 NOT NULL,
    total_practice_time integer DEFAULT 0 NOT NULL,
    sessions_completed integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.weekly_analytics OWNER TO postgres;

--
-- TOC entry 5121 (class 2604 OID 18066)
-- Name: ai_models ai_model_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_models ALTER COLUMN ai_model_id SET DEFAULT nextval('public.ai_models_ai_model_id_seq'::regclass);


--
-- TOC entry 5129 (class 2604 OID 18126)
-- Name: ai_predictions prediction_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_predictions ALTER COLUMN prediction_id SET DEFAULT nextval('public.ai_predictions_prediction_id_seq'::regclass);


--
-- TOC entry 5143 (class 2604 OID 18252)
-- Name: analytics analytics_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analytics ALTER COLUMN analytics_id SET DEFAULT nextval('public.analytics_analytics_id_seq'::regclass);


--
-- TOC entry 5133 (class 2604 OID 18162)
-- Name: assessments assessment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessments ALTER COLUMN assessment_id SET DEFAULT nextval('public.assessments_assessment_id_seq'::regclass);


--
-- TOC entry 5102 (class 2604 OID 17947)
-- Name: audit_logs log_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN log_id SET DEFAULT nextval('public.audit_logs_log_id_seq'::regclass);


--
-- TOC entry 5136 (class 2604 OID 18197)
-- Name: feedback feedback_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedback ALTER COLUMN feedback_id SET DEFAULT nextval('public.feedback_feedback_id_seq'::regclass);


--
-- TOC entry 5111 (class 2604 OID 18011)
-- Name: lessons lesson_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons ALTER COLUMN lesson_id SET DEFAULT nextval('public.lessons_lesson_id_seq'::regclass);


--
-- TOC entry 5106 (class 2604 OID 17981)
-- Name: modules module_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules ALTER COLUMN module_id SET DEFAULT nextval('public.modules_module_id_seq'::regclass);


--
-- TOC entry 5100 (class 2604 OID 17927)
-- Name: password_reset_tokens token_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens ALTER COLUMN token_id SET DEFAULT nextval('public.password_reset_tokens_token_id_seq'::regclass);


--
-- TOC entry 5089 (class 2604 OID 17828)
-- Name: permissions permission_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions ALTER COLUMN permission_id SET DEFAULT nextval('public.permissions_permission_id_seq'::regclass);


--
-- TOC entry 5097 (class 2604 OID 17905)
-- Name: refresh_tokens token_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN token_id SET DEFAULT nextval('public.refresh_tokens_token_id_seq'::regclass);


--
-- TOC entry 5087 (class 2604 OID 17813)
-- Name: roles role_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN role_id SET DEFAULT nextval('public.roles_role_id_seq'::regclass);


--
-- TOC entry 5104 (class 2604 OID 17965)
-- Name: sign_languages sign_language_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sign_languages ALTER COLUMN sign_language_id SET DEFAULT nextval('public.sign_languages_sign_language_id_seq'::regclass);


--
-- TOC entry 5118 (class 2604 OID 18042)
-- Name: signs sign_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signs ALTER COLUMN sign_id SET DEFAULT nextval('public.signs_sign_id_seq'::regclass);


--
-- TOC entry 5139 (class 2604 OID 18221)
-- Name: user_progress progress_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_progress ALTER COLUMN progress_id SET DEFAULT nextval('public.user_progress_progress_id_seq'::regclass);


--
-- TOC entry 5510 (class 0 OID 18063)
-- Dependencies: 243
-- Data for Name: ai_models; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ai_models (ai_model_id, model_name, version, model_type, file_path, accuracy_score, is_active, deployed_at, created_at) FROM stdin;
1	sign-classifier-mediapipe	v1.0.0	static_classifier	s3://models/sign-classifier/v1.0.0.onnx	92.50	t	2026-07-09 12:53:12.196764+05:30	2026-07-09 12:53:12.196764+05:30
\.


--
-- TOC entry 5513 (class 0 OID 18123)
-- Dependencies: 246
-- Data for Name: ai_predictions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ai_predictions (prediction_id, session_id, expected_sign_id, predicted_sign_id, ai_model_id, confidence_score, raw_landmarks, predicted_at, frame_sequence_no) FROM stdin;
\.


--
-- TOC entry 5521 (class 0 OID 18249)
-- Dependencies: 254
-- Data for Name: analytics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.analytics (analytics_id, user_id, metric_date, average_accuracy, completed_lessons, total_sessions, weak_sign, total_practice_time, created_at) FROM stdin;
\.


--
-- TOC entry 5515 (class 0 OID 18159)
-- Dependencies: 248
-- Data for Name: assessments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assessments (assessment_id, session_id, attempt_number, predicted_sign_id, expected_sign_id, confidence_score, accuracy_percentage, grade, created_at) FROM stdin;
\.


--
-- TOC entry 5500 (class 0 OID 17944)
-- Dependencies: 233
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (log_id, user_id, action, entity_type, entity_id, ip_address, metadata, created_at) FROM stdin;
\.


--
-- TOC entry 5522 (class 0 OID 18378)
-- Dependencies: 255
-- Data for Name: certificates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.certificates (certificate_id, user_id, module_id, certificate_code, issued_date, certificate_url, status) FROM stdin;
\.


--
-- TOC entry 5517 (class 0 OID 18194)
-- Dependencies: 250
-- Data for Name: feedback; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.feedback (feedback_id, assessment_id, feedback_code, message, severity, created_at) FROM stdin;
\.


--
-- TOC entry 5525 (class 0 OID 18454)
-- Dependencies: 258
-- Data for Name: instructor_students; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instructor_students (instructor_student_id, instructor_id, learner_id, assigned_date, status, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5506 (class 0 OID 18008)
-- Dependencies: 239
-- Data for Name: lessons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lessons (lesson_id, module_id, title, description, sequence_order, estimated_duration_minutes, difficulty_level, is_published, created_at, updated_at, category, difficulty) FROM stdin;
1	1	Saying Hello	Learn the sign for Hello	1	5	beginner	t	2026-07-09 12:53:12.196764+05:30	2026-07-09 12:53:12.196764+05:30	Alphabet	Easy
\.


--
-- TOC entry 5504 (class 0 OID 17978)
-- Dependencies: 237
-- Data for Name: modules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.modules (module_id, sign_language_id, title, description, difficulty_level, sequence_order, is_published, created_at, updated_at) FROM stdin;
1	1	Basic Greetings	Learn to greet in ASL	beginner	1	t	2026-07-09 12:53:12.196764+05:30	2026-07-09 12:53:12.196764+05:30
\.


--
-- TOC entry 5498 (class 0 OID 17924)
-- Dependencies: 231
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (token_id, user_id, token_hash, expires_at, used_at, created_at) FROM stdin;
\.


--
-- TOC entry 5491 (class 0 OID 17825)
-- Dependencies: 224
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (permission_id, permission_key, description) FROM stdin;
1	lesson:view	View published lessons
2	lesson:manage	Create/edit/publish lessons and modules
3	user:manage	Manage user accounts and roles
4	analytics:view_own	View own analytics/dashboard
5	analytics:view_all	View analytics for all users
\.


--
-- TOC entry 5511 (class 0 OID 18085)
-- Dependencies: 244
-- Data for Name: practice_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.practice_sessions (session_id, user_id, lesson_id, expected_sign_id, status, started_at, ended_at, attempt_count, duration_seconds, device_info) FROM stdin;
\.


--
-- TOC entry 5523 (class 0 OID 18404)
-- Dependencies: 256
-- Data for Name: recommendations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recommendations (recommendation_id, user_id, lesson_id, recommendation_type, priority, message, is_completed, created_at) FROM stdin;
\.


--
-- TOC entry 5496 (class 0 OID 17902)
-- Dependencies: 229
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (token_id, user_id, token_hash, expires_at, revoked, created_at) FROM stdin;
\.


--
-- TOC entry 5492 (class 0 OID 17837)
-- Dependencies: 225
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permissions (role_id, permission_id, granted_at) FROM stdin;
2	1	2026-07-09 12:35:00.307144+05:30
2	2	2026-07-09 12:35:00.307144+05:30
2	3	2026-07-09 12:35:00.307144+05:30
2	4	2026-07-09 12:35:00.307144+05:30
2	5	2026-07-09 12:35:00.307144+05:30
1	1	2026-07-09 12:35:00.307144+05:30
1	4	2026-07-09 12:35:00.307144+05:30
\.


--
-- TOC entry 5489 (class 0 OID 17810)
-- Dependencies: 222
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (role_id, role_name, description, created_at) FROM stdin;
1	learner	Default end-user practicing sign language	2026-07-09 12:35:00.307144+05:30
2	admin	Platform administrator with full access	2026-07-09 12:35:00.307144+05:30
3	instructor	Reserved for future Instructor Module (Milestone 4)	2026-07-09 12:35:00.307144+05:30
\.


--
-- TOC entry 5502 (class 0 OID 17962)
-- Dependencies: 235
-- Data for Name: sign_languages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sign_languages (sign_language_id, code, name, description, is_active) FROM stdin;
1	ASL	American Sign Language	Primary language supported at Milestone 1	t
\.


--
-- TOC entry 5508 (class 0 OID 18039)
-- Dependencies: 241
-- Data for Name: signs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.signs (sign_id, lesson_id, sign_name, sign_type, reference_video_url, reference_image_url, description, created_at) FROM stdin;
1	1	Hello	static	\N	\N	Open hand near forehead moving outward	2026-07-09 12:53:12.196764+05:30
\.


--
-- TOC entry 5519 (class 0 OID 18218)
-- Dependencies: 252
-- Data for Name: user_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_progress (progress_id, user_id, lesson_id, status, best_accuracy, attempts_count, completed_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5494 (class 0 OID 17882)
-- Dependencies: 227
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_roles (user_id, role_id, assigned_at) FROM stdin;
\.


--
-- TOC entry 5493 (class 0 OID 17856)
-- Dependencies: 226
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, full_name, email, username, password_hash, phone, date_of_birth, profile_picture_url, is_active, is_email_verified, last_login_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5524 (class 0 OID 18432)
-- Dependencies: 257
-- Data for Name: weekly_analytics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.weekly_analytics (weekly_analytics_id, user_id, week_start, average_accuracy, completed_lessons, total_practice_time, sessions_completed) FROM stdin;
\.


--
-- TOC entry 5548 (class 0 OID 0)
-- Dependencies: 242
-- Name: ai_models_ai_model_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ai_models_ai_model_id_seq', 10, true);


--
-- TOC entry 5549 (class 0 OID 0)
-- Dependencies: 245
-- Name: ai_predictions_prediction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ai_predictions_prediction_id_seq', 1, false);


--
-- TOC entry 5550 (class 0 OID 0)
-- Dependencies: 253
-- Name: analytics_analytics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.analytics_analytics_id_seq', 1, false);


--
-- TOC entry 5551 (class 0 OID 0)
-- Dependencies: 247
-- Name: assessments_assessment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assessments_assessment_id_seq', 1, false);


--
-- TOC entry 5552 (class 0 OID 0)
-- Dependencies: 232
-- Name: audit_logs_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_log_id_seq', 1, false);


--
-- TOC entry 5553 (class 0 OID 0)
-- Dependencies: 249
-- Name: feedback_feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.feedback_feedback_id_seq', 1, false);


--
-- TOC entry 5554 (class 0 OID 0)
-- Dependencies: 238
-- Name: lessons_lesson_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lessons_lesson_id_seq', 10, true);


--
-- TOC entry 5555 (class 0 OID 0)
-- Dependencies: 236
-- Name: modules_module_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.modules_module_id_seq', 10, true);


--
-- TOC entry 5556 (class 0 OID 0)
-- Dependencies: 230
-- Name: password_reset_tokens_token_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.password_reset_tokens_token_id_seq', 1, false);


--
-- TOC entry 5557 (class 0 OID 0)
-- Dependencies: 223
-- Name: permissions_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permissions_permission_id_seq', 65, true);


--
-- TOC entry 5558 (class 0 OID 0)
-- Dependencies: 228
-- Name: refresh_tokens_token_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.refresh_tokens_token_id_seq', 1, false);


--
-- TOC entry 5559 (class 0 OID 0)
-- Dependencies: 221
-- Name: roles_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_role_id_seq', 39, true);


--
-- TOC entry 5560 (class 0 OID 0)
-- Dependencies: 234
-- Name: sign_languages_sign_language_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sign_languages_sign_language_id_seq', 10, true);


--
-- TOC entry 5561 (class 0 OID 0)
-- Dependencies: 240
-- Name: signs_sign_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.signs_sign_id_seq', 10, true);


--
-- TOC entry 5562 (class 0 OID 0)
-- Dependencies: 251
-- Name: user_progress_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_progress_progress_id_seq', 1, false);


--
-- TOC entry 5244 (class 2606 OID 18082)
-- Name: ai_models ai_models_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_models
    ADD CONSTRAINT ai_models_pkey PRIMARY KEY (ai_model_id);


--
-- TOC entry 5255 (class 2606 OID 18137)
-- Name: ai_predictions ai_predictions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_predictions
    ADD CONSTRAINT ai_predictions_pkey PRIMARY KEY (prediction_id);


--
-- TOC entry 5278 (class 2606 OID 18266)
-- Name: analytics analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analytics
    ADD CONSTRAINT analytics_pkey PRIMARY KEY (analytics_id);


--
-- TOC entry 5263 (class 2606 OID 18175)
-- Name: assessments assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_pkey PRIMARY KEY (assessment_id);


--
-- TOC entry 5219 (class 2606 OID 17955)
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (log_id);


--
-- TOC entry 5285 (class 2606 OID 18393)
-- Name: certificates certificates_certificate_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_certificate_code_key UNIQUE (certificate_code);


--
-- TOC entry 5287 (class 2606 OID 18391)
-- Name: certificates certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_pkey PRIMARY KEY (certificate_id);


--
-- TOC entry 5269 (class 2606 OID 18211)
-- Name: feedback feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_pkey PRIMARY KEY (feedback_id);


--
-- TOC entry 5302 (class 2606 OID 18468)
-- Name: instructor_students instructor_students_instructor_id_learner_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructor_students
    ADD CONSTRAINT instructor_students_instructor_id_learner_id_key UNIQUE (instructor_id, learner_id);


--
-- TOC entry 5304 (class 2606 OID 18466)
-- Name: instructor_students instructor_students_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructor_students
    ADD CONSTRAINT instructor_students_pkey PRIMARY KEY (instructor_student_id);


--
-- TOC entry 5235 (class 2606 OID 18029)
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (lesson_id);


--
-- TOC entry 5229 (class 2606 OID 17998)
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (module_id);


--
-- TOC entry 5215 (class 2606 OID 17935)
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (token_id);


--
-- TOC entry 5191 (class 2606 OID 17834)
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (permission_id);


--
-- TOC entry 5253 (class 2606 OID 18106)
-- Name: practice_sessions practice_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.practice_sessions
    ADD CONSTRAINT practice_sessions_pkey PRIMARY KEY (session_id);


--
-- TOC entry 5293 (class 2606 OID 18421)
-- Name: recommendations recommendations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recommendations
    ADD CONSTRAINT recommendations_pkey PRIMARY KEY (recommendation_id);


--
-- TOC entry 5210 (class 2606 OID 17915)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (token_id);


--
-- TOC entry 5196 (class 2606 OID 17845)
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- TOC entry 5187 (class 2606 OID 17821)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (role_id);


--
-- TOC entry 5223 (class 2606 OID 17974)
-- Name: sign_languages sign_languages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sign_languages
    ADD CONSTRAINT sign_languages_pkey PRIMARY KEY (sign_language_id);


--
-- TOC entry 5240 (class 2606 OID 18054)
-- Name: signs signs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signs
    ADD CONSTRAINT signs_pkey PRIMARY KEY (sign_id);


--
-- TOC entry 5246 (class 2606 OID 18084)
-- Name: ai_models uq_ai_models_name_version; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_models
    ADD CONSTRAINT uq_ai_models_name_version UNIQUE (model_name, version);


--
-- TOC entry 5283 (class 2606 OID 18268)
-- Name: analytics uq_analytics_user_date; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analytics
    ADD CONSTRAINT uq_analytics_user_date UNIQUE (user_id, metric_date);


--
-- TOC entry 5267 (class 2606 OID 18177)
-- Name: assessments uq_assessments_session_attempt; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT uq_assessments_session_attempt UNIQUE (session_id, attempt_number);


--
-- TOC entry 5237 (class 2606 OID 18031)
-- Name: lessons uq_lessons_module_seq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT uq_lessons_module_seq UNIQUE (module_id, sequence_order);


--
-- TOC entry 5231 (class 2606 OID 18000)
-- Name: modules uq_modules_lang_seq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT uq_modules_lang_seq UNIQUE (sign_language_id, sequence_order);


--
-- TOC entry 5193 (class 2606 OID 17836)
-- Name: permissions uq_permissions_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT uq_permissions_key UNIQUE (permission_key);


--
-- TOC entry 5217 (class 2606 OID 17937)
-- Name: password_reset_tokens uq_pwreset_tokens_hash; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT uq_pwreset_tokens_hash UNIQUE (token_hash);


--
-- TOC entry 5212 (class 2606 OID 17917)
-- Name: refresh_tokens uq_refresh_tokens_hash; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT uq_refresh_tokens_hash UNIQUE (token_hash);


--
-- TOC entry 5189 (class 2606 OID 17823)
-- Name: roles uq_roles_role_name; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT uq_roles_role_name UNIQUE (role_name);


--
-- TOC entry 5225 (class 2606 OID 17976)
-- Name: sign_languages uq_sign_languages_code; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sign_languages
    ADD CONSTRAINT uq_sign_languages_code UNIQUE (code);


--
-- TOC entry 5242 (class 2606 OID 18056)
-- Name: signs uq_signs_lesson_name; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signs
    ADD CONSTRAINT uq_signs_lesson_name UNIQUE (lesson_id, sign_name);


--
-- TOC entry 5274 (class 2606 OID 18236)
-- Name: user_progress uq_user_progress_user_lesson; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT uq_user_progress_user_lesson UNIQUE (user_id, lesson_id);


--
-- TOC entry 5199 (class 2606 OID 17878)
-- Name: users uq_users_email; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uq_users_email UNIQUE (email);


--
-- TOC entry 5201 (class 2606 OID 17880)
-- Name: users uq_users_username; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uq_users_username UNIQUE (username);


--
-- TOC entry 5276 (class 2606 OID 18234)
-- Name: user_progress user_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_pkey PRIMARY KEY (progress_id);


--
-- TOC entry 5206 (class 2606 OID 17890)
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- TOC entry 5203 (class 2606 OID 17876)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 5296 (class 2606 OID 18446)
-- Name: weekly_analytics weekly_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weekly_analytics
    ADD CONSTRAINT weekly_analytics_pkey PRIMARY KEY (weekly_analytics_id);


--
-- TOC entry 5298 (class 2606 OID 18448)
-- Name: weekly_analytics weekly_analytics_user_id_week_start_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weekly_analytics
    ADD CONSTRAINT weekly_analytics_user_id_week_start_key UNIQUE (user_id, week_start);


--
-- TOC entry 5256 (class 1259 OID 18300)
-- Name: idx_ai_predictions_ai_model_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ai_predictions_ai_model_id ON public.ai_predictions USING btree (ai_model_id);


--
-- TOC entry 5257 (class 1259 OID 18301)
-- Name: idx_ai_predictions_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ai_predictions_created_at ON public.ai_predictions USING btree (predicted_at);


--
-- TOC entry 5258 (class 1259 OID 18298)
-- Name: idx_ai_predictions_expected_sign_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ai_predictions_expected_sign_id ON public.ai_predictions USING btree (expected_sign_id);


--
-- TOC entry 5259 (class 1259 OID 18329)
-- Name: idx_ai_predictions_predicted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ai_predictions_predicted_at ON public.ai_predictions USING btree (predicted_at);


--
-- TOC entry 5260 (class 1259 OID 18299)
-- Name: idx_ai_predictions_predicted_sign_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ai_predictions_predicted_sign_id ON public.ai_predictions USING btree (predicted_sign_id);


--
-- TOC entry 5261 (class 1259 OID 18297)
-- Name: idx_ai_predictions_session_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ai_predictions_session_id ON public.ai_predictions USING btree (session_id);


--
-- TOC entry 5279 (class 1259 OID 18308)
-- Name: idx_analytics_metric_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analytics_metric_date ON public.analytics USING btree (metric_date);


--
-- TOC entry 5280 (class 1259 OID 18307)
-- Name: idx_analytics_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analytics_user_id ON public.analytics USING btree (user_id);


--
-- TOC entry 5281 (class 1259 OID 18309)
-- Name: idx_analytics_weak_sign; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analytics_weak_sign ON public.analytics USING btree (weak_sign);


--
-- TOC entry 5264 (class 1259 OID 18303)
-- Name: idx_assessments_expected_sign_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assessments_expected_sign_id ON public.assessments USING btree (expected_sign_id);


--
-- TOC entry 5265 (class 1259 OID 18302)
-- Name: idx_assessments_predicted_sign_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assessments_predicted_sign_id ON public.assessments USING btree (predicted_sign_id);


--
-- TOC entry 5220 (class 1259 OID 18286)
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at);


--
-- TOC entry 5221 (class 1259 OID 18285)
-- Name: idx_audit_logs_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs USING btree (user_id);


--
-- TOC entry 5288 (class 1259 OID 18480)
-- Name: idx_certificates_module_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_certificates_module_id ON public.certificates USING btree (module_id);


--
-- TOC entry 5289 (class 1259 OID 18479)
-- Name: idx_certificates_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_certificates_user_id ON public.certificates USING btree (user_id);


--
-- TOC entry 5270 (class 1259 OID 18304)
-- Name: idx_feedback_assessment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_feedback_assessment_id ON public.feedback USING btree (assessment_id);


--
-- TOC entry 5299 (class 1259 OID 18484)
-- Name: idx_instructor_students_instructor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_instructor_students_instructor_id ON public.instructor_students USING btree (instructor_id);


--
-- TOC entry 5300 (class 1259 OID 18485)
-- Name: idx_instructor_students_learner_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_instructor_students_learner_id ON public.instructor_students USING btree (learner_id);


--
-- TOC entry 5232 (class 1259 OID 18290)
-- Name: idx_lessons_is_published; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lessons_is_published ON public.lessons USING btree (is_published) WHERE (is_published = true);


--
-- TOC entry 5233 (class 1259 OID 18289)
-- Name: idx_lessons_module_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lessons_module_id ON public.lessons USING btree (module_id);


--
-- TOC entry 5226 (class 1259 OID 18288)
-- Name: idx_modules_is_published; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_modules_is_published ON public.modules USING btree (is_published) WHERE (is_published = true);


--
-- TOC entry 5227 (class 1259 OID 18287)
-- Name: idx_modules_sign_language_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_modules_sign_language_id ON public.modules USING btree (sign_language_id);


--
-- TOC entry 5213 (class 1259 OID 18284)
-- Name: idx_password_reset_tokens_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_password_reset_tokens_user_id ON public.password_reset_tokens USING btree (user_id);


--
-- TOC entry 5247 (class 1259 OID 18294)
-- Name: idx_practice_sessions_expected_sign_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_practice_sessions_expected_sign_id ON public.practice_sessions USING btree (expected_sign_id);


--
-- TOC entry 5248 (class 1259 OID 18293)
-- Name: idx_practice_sessions_lesson_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_practice_sessions_lesson_id ON public.practice_sessions USING btree (lesson_id);


--
-- TOC entry 5249 (class 1259 OID 18295)
-- Name: idx_practice_sessions_started_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_practice_sessions_started_at ON public.practice_sessions USING btree (started_at);


--
-- TOC entry 5250 (class 1259 OID 18296)
-- Name: idx_practice_sessions_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_practice_sessions_status ON public.practice_sessions USING btree (status);


--
-- TOC entry 5251 (class 1259 OID 18292)
-- Name: idx_practice_sessions_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_practice_sessions_user_id ON public.practice_sessions USING btree (user_id);


--
-- TOC entry 5290 (class 1259 OID 18482)
-- Name: idx_recommendations_lesson_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_recommendations_lesson_id ON public.recommendations USING btree (lesson_id);


--
-- TOC entry 5291 (class 1259 OID 18481)
-- Name: idx_recommendations_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_recommendations_user_id ON public.recommendations USING btree (user_id);


--
-- TOC entry 5207 (class 1259 OID 18283)
-- Name: idx_refresh_tokens_expires_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refresh_tokens_expires_at ON public.refresh_tokens USING btree (expires_at);


--
-- TOC entry 5208 (class 1259 OID 18282)
-- Name: idx_refresh_tokens_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refresh_tokens_user_id ON public.refresh_tokens USING btree (user_id);


--
-- TOC entry 5194 (class 1259 OID 18279)
-- Name: idx_role_permissions_permission_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_role_permissions_permission_id ON public.role_permissions USING btree (permission_id);


--
-- TOC entry 5238 (class 1259 OID 18291)
-- Name: idx_signs_lesson_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_signs_lesson_id ON public.signs USING btree (lesson_id);


--
-- TOC entry 5271 (class 1259 OID 18306)
-- Name: idx_user_progress_lesson_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_progress_lesson_id ON public.user_progress USING btree (lesson_id);


--
-- TOC entry 5272 (class 1259 OID 18305)
-- Name: idx_user_progress_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_progress_user_id ON public.user_progress USING btree (user_id);


--
-- TOC entry 5204 (class 1259 OID 18280)
-- Name: idx_user_roles_role_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_roles_role_id ON public.user_roles USING btree (role_id);


--
-- TOC entry 5197 (class 1259 OID 18281)
-- Name: idx_users_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_is_active ON public.users USING btree (is_active) WHERE (is_active = true);


--
-- TOC entry 5294 (class 1259 OID 18483)
-- Name: idx_weekly_analytics_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_weekly_analytics_user_id ON public.weekly_analytics USING btree (user_id);


--
-- TOC entry 5339 (class 2620 OID 18376)
-- Name: lessons trg_lessons_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_lessons_updated_at BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 5338 (class 2620 OID 18375)
-- Name: modules trg_modules_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_modules_updated_at BEFORE UPDATE ON public.modules FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 5340 (class 2620 OID 18377)
-- Name: user_progress trg_user_progress_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_user_progress_updated_at BEFORE UPDATE ON public.user_progress FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 5337 (class 2620 OID 18374)
-- Name: users trg_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 5318 (class 2606 OID 18153)
-- Name: ai_predictions ai_predictions_ai_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_predictions
    ADD CONSTRAINT ai_predictions_ai_model_id_fkey FOREIGN KEY (ai_model_id) REFERENCES public.ai_models(ai_model_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5319 (class 2606 OID 18143)
-- Name: ai_predictions ai_predictions_expected_sign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_predictions
    ADD CONSTRAINT ai_predictions_expected_sign_id_fkey FOREIGN KEY (expected_sign_id) REFERENCES public.signs(sign_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5320 (class 2606 OID 18148)
-- Name: ai_predictions ai_predictions_predicted_sign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_predictions
    ADD CONSTRAINT ai_predictions_predicted_sign_id_fkey FOREIGN KEY (predicted_sign_id) REFERENCES public.signs(sign_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5321 (class 2606 OID 18138)
-- Name: ai_predictions ai_predictions_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_predictions
    ADD CONSTRAINT ai_predictions_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.practice_sessions(session_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5328 (class 2606 OID 18269)
-- Name: analytics analytics_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analytics
    ADD CONSTRAINT analytics_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5329 (class 2606 OID 18274)
-- Name: analytics analytics_weak_sign_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analytics
    ADD CONSTRAINT analytics_weak_sign_fkey FOREIGN KEY (weak_sign) REFERENCES public.signs(sign_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5322 (class 2606 OID 18188)
-- Name: assessments assessments_expected_sign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_expected_sign_id_fkey FOREIGN KEY (expected_sign_id) REFERENCES public.signs(sign_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5323 (class 2606 OID 18183)
-- Name: assessments assessments_predicted_sign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_predicted_sign_id_fkey FOREIGN KEY (predicted_sign_id) REFERENCES public.signs(sign_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5324 (class 2606 OID 18178)
-- Name: assessments assessments_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.practice_sessions(session_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5311 (class 2606 OID 17956)
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5330 (class 2606 OID 18399)
-- Name: certificates certificates_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(module_id);


--
-- TOC entry 5331 (class 2606 OID 18394)
-- Name: certificates certificates_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 5325 (class 2606 OID 18212)
-- Name: feedback feedback_assessment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(assessment_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5335 (class 2606 OID 18469)
-- Name: instructor_students instructor_students_instructor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructor_students
    ADD CONSTRAINT instructor_students_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.users(user_id);


--
-- TOC entry 5336 (class 2606 OID 18474)
-- Name: instructor_students instructor_students_learner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructor_students
    ADD CONSTRAINT instructor_students_learner_id_fkey FOREIGN KEY (learner_id) REFERENCES public.users(user_id);


--
-- TOC entry 5313 (class 2606 OID 18032)
-- Name: lessons lessons_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(module_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5312 (class 2606 OID 18001)
-- Name: modules modules_sign_language_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_sign_language_id_fkey FOREIGN KEY (sign_language_id) REFERENCES public.sign_languages(sign_language_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5310 (class 2606 OID 17938)
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5315 (class 2606 OID 18117)
-- Name: practice_sessions practice_sessions_expected_sign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.practice_sessions
    ADD CONSTRAINT practice_sessions_expected_sign_id_fkey FOREIGN KEY (expected_sign_id) REFERENCES public.signs(sign_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5316 (class 2606 OID 18112)
-- Name: practice_sessions practice_sessions_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.practice_sessions
    ADD CONSTRAINT practice_sessions_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5317 (class 2606 OID 18107)
-- Name: practice_sessions practice_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.practice_sessions
    ADD CONSTRAINT practice_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5332 (class 2606 OID 18427)
-- Name: recommendations recommendations_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recommendations
    ADD CONSTRAINT recommendations_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id);


--
-- TOC entry 5333 (class 2606 OID 18422)
-- Name: recommendations recommendations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recommendations
    ADD CONSTRAINT recommendations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 5309 (class 2606 OID 17918)
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5305 (class 2606 OID 17851)
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(permission_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5306 (class 2606 OID 17846)
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5314 (class 2606 OID 18057)
-- Name: signs signs_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signs
    ADD CONSTRAINT signs_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5326 (class 2606 OID 18242)
-- Name: user_progress user_progress_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5327 (class 2606 OID 18237)
-- Name: user_progress user_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5307 (class 2606 OID 17896)
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5308 (class 2606 OID 17891)
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5334 (class 2606 OID 18449)
-- Name: weekly_analytics weekly_analytics_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weekly_analytics
    ADD CONSTRAINT weekly_analytics_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


-- Completed on 2026-07-22 00:39:07

--
-- PostgreSQL database dump complete
--


-- ================================================================
-- MILESTONE 3 — DAY 2 (Intern 5: Database & QA)
-- New tables: notifications, badges, user_badges, streaks
-- Plus leaderboard-supporting indexes
-- ================================================================

-- ----------------------------------------------------------------
-- notifications
-- ----------------------------------------------------------------

CREATE SEQUENCE public.notifications_notification_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.notifications_notification_id_seq OWNER TO postgres;

CREATE TABLE public.notifications (
    notification_id      bigint NOT NULL,
    user_id               uuid NOT NULL,
    notification_type     character varying(50) NOT NULL,
    title                  character varying(150) NOT NULL,
    message                text NOT NULL,
    is_read                boolean DEFAULT false NOT NULL,
    read_at                timestamp with time zone,
    related_entity_type    character varying(50),
    related_entity_id      character varying(50),
    created_at             timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_notifications_read_consistency CHECK (
        ((is_read = false) AND (read_at IS NULL))
        OR ((is_read = true) AND (read_at IS NOT NULL))
    )
);

ALTER TABLE public.notifications OWNER TO postgres;

ALTER SEQUENCE public.notifications_notification_id_seq OWNED BY public.notifications.notification_id;

ALTER TABLE ONLY public.notifications
    ALTER COLUMN notification_id SET DEFAULT nextval('public.notifications_notification_id_seq'::regclass);

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (notification_id);

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Fetch "my notifications" (Intern 2's list API)
CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);

-- Unread-count / bell dot (Intern 1 Day 2) — partial index, same pattern as idx_users_is_active
CREATE INDEX idx_notifications_user_unread ON public.notifications USING btree (user_id)
    WHERE (is_read = false);

-- Ordering the bell dropdown by newest first
CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at);


-- ----------------------------------------------------------------
-- badges (catalog of badge definitions)
-- ----------------------------------------------------------------

CREATE SEQUENCE public.badges_badge_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.badges_badge_id_seq OWNER TO postgres;

CREATE TABLE public.badges (
    badge_id               integer NOT NULL,
    badge_code             character varying(50) NOT NULL,
    badge_name             character varying(100) NOT NULL,
    description             text,
    icon_url                text,
    criteria_description    text,
    is_active               boolean DEFAULT true NOT NULL,
    created_at              timestamp with time zone DEFAULT now() NOT NULL,
    updated_at              timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.badges OWNER TO postgres;

ALTER SEQUENCE public.badges_badge_id_seq OWNED BY public.badges.badge_id;

ALTER TABLE ONLY public.badges
    ALTER COLUMN badge_id SET DEFAULT nextval('public.badges_badge_id_seq'::regclass);

ALTER TABLE ONLY public.badges
    ADD CONSTRAINT badges_pkey PRIMARY KEY (badge_id);

ALTER TABLE ONLY public.badges
    ADD CONSTRAINT uq_badges_code UNIQUE (badge_code);

CREATE TRIGGER trg_badges_updated_at BEFORE UPDATE ON public.badges
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Only active badges should be shown as earnable / listed to learners
CREATE INDEX idx_badges_is_active ON public.badges USING btree (is_active)
    WHERE (is_active = true);


-- ----------------------------------------------------------------
-- user_badges (which user earned which badge, and when)
-- ----------------------------------------------------------------

CREATE SEQUENCE public.user_badges_user_badge_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.user_badges_user_badge_id_seq OWNER TO postgres;

CREATE TABLE public.user_badges (
    user_badge_id    bigint NOT NULL,
    user_id           uuid NOT NULL,
    badge_id          integer NOT NULL,
    earned_at         timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.user_badges OWNER TO postgres;

ALTER SEQUENCE public.user_badges_user_badge_id_seq OWNED BY public.user_badges.user_badge_id;

ALTER TABLE ONLY public.user_badges
    ALTER COLUMN user_badge_id SET DEFAULT nextval('public.user_badges_user_badge_id_seq'::regclass);

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_pkey PRIMARY KEY (user_badge_id);

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT uq_user_badges_user_badge UNIQUE (user_id, badge_id);

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_badge_id_fkey FOREIGN KEY (badge_id)
        REFERENCES public.badges(badge_id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- "My badges" dashboard cards (Intern 1 Day 3)
CREATE INDEX idx_user_badges_user_id ON public.user_badges USING btree (user_id);


-- ----------------------------------------------------------------
-- streaks (one row per user — current streak state, not a log)
-- ----------------------------------------------------------------

CREATE TABLE public.streaks (
    user_id                uuid NOT NULL,
    current_streak         integer DEFAULT 0 NOT NULL,
    longest_streak         integer DEFAULT 0 NOT NULL,
    last_practice_date     date,
    updated_at             timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_streaks_current_nonneg CHECK (current_streak >= 0),
    CONSTRAINT chk_streaks_longest_nonneg CHECK (longest_streak >= 0),
    CONSTRAINT chk_streaks_longest_ge_current CHECK (longest_streak >= current_streak)
);

ALTER TABLE public.streaks OWNER TO postgres;

ALTER TABLE ONLY public.streaks
    ADD CONSTRAINT streaks_pkey PRIMARY KEY (user_id);

ALTER TABLE ONLY public.streaks
    ADD CONSTRAINT streaks_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;

CREATE TRIGGER trg_streaks_updated_at BEFORE UPDATE ON public.streaks
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Leaderboard "By Streak" ranking (Day 2 explicit requirement)
CREATE INDEX idx_streaks_current_streak ON public.streaks USING btree (current_streak DESC);


-- ----------------------------------------------------------------
-- Leaderboard "By Accuracy" support — existing Milestone 2 table,
-- this column had no index until now
-- ----------------------------------------------------------------

CREATE INDEX idx_analytics_average_accuracy ON public.analytics USING btree (average_accuracy DESC);
